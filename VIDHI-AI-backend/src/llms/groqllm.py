import os
import time
from pathlib import Path
from dotenv import load_dotenv

try:
    from langchain_groq import ChatGroq
except ImportError:
    ChatGroq = None  # type: ignore

try:
    from groq import BadRequestError, RateLimitError, APIConnectionError
except ImportError:
    class BadRequestError(Exception):  # type: ignore
        pass

    class RateLimitError(Exception):  # type: ignore
        pass

    class APIConnectionError(Exception):  # type: ignore
        pass


class GroqLLM:
    """
    Wrapper so nodes can call llm.invoke(prompt) with automatic retry and key fallback.
    Supports multiple keys (primary + backup) so service never interrupts on rate limits.
    """

    def __init__(self):
        load_dotenv()
        project_dir = Path(__file__).resolve().parents[2]
        for candidate in (project_dir / ".env", project_dir.parent / ".env"):
            if candidate.exists():
                load_dotenv(candidate)

        # Collect configured keys (primary and backups)
        raw_keys = [
            os.getenv("GROQ_API_KEY", ""),
            os.getenv("GROQ_BACKUP_API_KEY", ""),
            os.getenv("GROQ_PREV_API_KEY", ""),
        ]
        self.api_keys = [k.strip() for k in raw_keys if k and k.strip() and k.strip() != "your_groq_api_key_here"]

        if not self.api_keys:
            raise ValueError(
                "GROQ_API_KEY is not configured in Vercel environment variables. Please add GROQ_API_KEY in Vercel Project Settings > Environment Variables."
            )

        self.current_key_idx = 0
        self.api_key = self.api_keys[self.current_key_idx]

        if ChatGroq is None:
            raise ImportError(
                "langchain_groq is not installed. Please run: pip install langchain-groq groq"
            )

        self.model_name = (os.getenv("GROQ_MODEL") or "openai/gpt-oss-20b").strip()
        self.max_tokens = int(os.getenv("GROQ_MAX_TOKENS", "1500"))
        self.llm = self._create_llm(self.api_key)

    def _create_llm(self, api_key: str):
        return ChatGroq(
            api_key=api_key,
            model=self.model_name,
            max_tokens=self.max_tokens,
            request_timeout=45.0,
        )

    def _switch_to_next_key(self):
        if len(self.api_keys) > 1:
            self.current_key_idx = (self.current_key_idx + 1) % len(self.api_keys)
            self.api_key = self.api_keys[self.current_key_idx]
            self.llm = self._create_llm(self.api_key)
            print(f"🔄 Switched to Groq key {self.current_key_idx + 1}/{len(self.api_keys)}")

    def invoke(self, prompt: str):
        """
        Invoke Groq with retry logic and multi-key fallback.
        """
        last_exc = None
        max_attempts = max(3, len(self.api_keys) * 2)

        for attempt in range(max_attempts):
            try:
                return self.llm.invoke(prompt)
            except Exception as exc:
                last_exc = exc
                err_str = str(exc).lower()
                if "request too large" in err_str:
                    raise

                # If rate-limited, expired, or unauthorized, rotate key immediately
                if any(k in err_str for k in ["rate_limit", "429", "invalid_api_key", "unauthorized", "expired", "401"]):
                    self._switch_to_next_key()

                if attempt < max_attempts - 1:
                    time.sleep(1.5 * (attempt % 3 + 1))
                else:
                    raise last_exc

    def get_llm(self):
        return self.llm
