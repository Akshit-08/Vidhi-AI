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
    Wrapper so nodes can call llm.invoke(prompt) with automatic retry and error handling.
    """

    def __init__(self):
        load_dotenv()
        project_dir = Path(__file__).resolve().parents[2]
        for candidate in (project_dir / ".env", project_dir.parent / ".env"):
            if candidate.exists():
                load_dotenv(candidate)

        self.api_key = (os.getenv("GROQ_API_KEY") or "").strip()
        if not self.api_key or self.api_key == "your_groq_api_key_here":
            raise ValueError(
                "GROQ_API_KEY is not configured in Vercel environment variables. Please add GROQ_API_KEY in Vercel Project Settings > Environment Variables."
            )

        if ChatGroq is None:
            raise ImportError(
                "langchain_groq is not installed. Please run: pip install langchain-groq groq"
            )

        # Create underlying Groq LLM
        model_name = (os.getenv("GROQ_MODEL") or "openai/gpt-oss-20b").strip()
        self.llm = ChatGroq(
            api_key=self.api_key,
            model=model_name,
            max_tokens=int(os.getenv("GROQ_MAX_TOKENS", "1500")),
            request_timeout=45.0,
        )

    def invoke(self, prompt: str):
        """
        Invoke Groq with retry logic.
        """
        last_exc = None
        for attempt in range(3):
            try:
                return self.llm.invoke(prompt)
            except Exception as exc:
                last_exc = exc
                err_str = str(exc)
                if "Request too large" in err_str:
                    raise
                if attempt < 2:
                    time.sleep(2.0 * (attempt + 1))
                else:
                    raise last_exc

    def get_llm(self):
        return self.llm
