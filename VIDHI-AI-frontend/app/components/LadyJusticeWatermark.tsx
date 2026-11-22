"use client";

import React from "react";

/**
 * High-detail classical copperplate engraving illustration of Lady Justice (Justitia)
 * Styled in warm courtroom burgundy line art, matching the reference courtroom immersion screen.
 */
export default function LadyJusticeWatermark({
  className = "w-full h-full",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 500 850"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMinYMid meet"
    >
      <g stroke="#782323" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.82">
        {/* Head, Hair & Blindfold */}
        <path d="M 235 155 Q 240 135 255 130 Q 275 130 280 145 Q 285 160 280 175 Q 275 190 260 195 Q 245 195 238 180 Z" fill="#fcf6ec" fillOpacity="0.4" />
        <path d="M 240 140 Q 255 120 275 125 Q 290 130 292 145 C 295 160 290 175 285 190 C 275 210 260 215 245 205 Q 235 195 238 180" />
        {/* Hair curls / bun */}
        <path d="M 270 125 C 285 110 305 120 300 135 C 295 145 285 145 280 138" />
        <path d="M 275 130 Q 295 130 290 150 Q 285 160 275 155" />
        <path d="M 245 135 Q 235 145 230 160 Q 225 175 232 185" />
        {/* Blindfold across eyes */}
        <path d="M 235 158 C 248 154 268 152 282 156 L 283 168 C 268 165 248 166 235 170 Z" fill="#782323" fillOpacity="0.25" strokeWidth="1.8" />
        {/* Blindfold tie ribbon at back of head */}
        <path d="M 283 160 Q 300 165 310 180 Q 315 195 305 210" strokeWidth="1.4" />
        <path d="M 285 166 Q 302 175 308 195 Q 310 215 302 225" strokeWidth="1.4" />
        {/* Facial profile & chin */}
        <path d="M 244 172 Q 242 178 245 182 Q 250 186 255 186 Q 260 186 262 180" />
        <path d="M 250 188 Q 252 195 258 196" />
        {/* Graceful Neck */}
        <path d="M 248 197 Q 248 215 240 230" />
        <path d="M 268 194 Q 272 215 282 230" />

        {/* Right Shoulder & Downward Sword Arm */}
        <path d="M 238 230 Q 205 245 175 280 Q 155 315 145 360 Q 138 400 135 440" />
        <path d="M 248 232 Q 215 255 195 290 Q 175 330 165 375 Q 158 415 152 455" />
        {/* Arm hatching / muscles */}
        <path d="M 195 280 C 185 300 178 325 175 350" strokeWidth="1.1" />
        <path d="M 185 300 C 178 320 172 345 170 370" strokeWidth="1.1" />
        <path d="M 175 330 C 168 350 165 375 162 400" strokeWidth="1.1" />
        {/* Right Hand gripping sword hilt */}
        <path d="M 135 440 C 130 450 130 465 138 475 C 145 480 155 475 155 460 C 155 450 148 440 135 440 Z" fill="#fcf6ec" fillOpacity="0.4" />
        <path d="M 132 452 Q 142 455 150 450" />
        <path d="M 133 460 Q 143 463 151 458" />
        <path d="M 135 468 Q 144 470 152 465" />

        {/* The Sword of Justice (Point down, resting toward pedestal) */}
        {/* Pommel & Grip */}
        <circle cx="143" cy="425" r="7" strokeWidth="2" fill="#fcf6ec" fillOpacity="0.6" />
        <path d="M 141 432 L 141 450 L 145 450 L 145 432 Z" strokeWidth="1.8" />
        {/* Crossguard */}
        <path d="M 115 450 Q 143 446 172 450 L 170 456 Q 143 452 117 456 Z" fill="#782323" fillOpacity="0.3" strokeWidth="1.8" />
        {/* Sword Blade (Long, straight, classical double-edged) */}
        <path d="M 139 456 L 85 780 L 89 780 L 147 456" fill="#fcf6ec" fillOpacity="0.5" strokeWidth="1.8" />
        {/* Blade Center Ridge Line */}
        <line x1="143" y1="456" x2="87" y2="780" strokeWidth="1.4" />
        {/* Blade Tip */}
        <path d="M 85 780 L 87 792 L 89 780 Z" fill="#782323" strokeWidth="1.8" />

        {/* Left Arm Raised High Holding Scales of Justice */}
        <path d="M 285 230 Q 320 220 345 190 Q 365 160 375 125" />
        <path d="M 295 240 Q 330 230 355 200 Q 375 170 388 132" />
        {/* Forearm & Wrist */}
        <path d="M 375 125 Q 380 105 382 85" strokeWidth="1.8" />
        <path d="M 388 132 Q 392 110 393 90" strokeWidth="1.8" />
        {/* Hand holding the Scales Loop */}
        <path d="M 380 85 C 378 75 385 68 393 70 C 400 72 402 82 396 90 Z" fill="#782323" fillOpacity="0.2" strokeWidth="1.8" />
        <circle cx="388" cy="74" r="5" strokeWidth="1.8" />

        {/* The Balance Scales (Equilibrium) */}
        {/* Top Suspension Cord */}
        <line x1="388" y1="79" x2="388" y2="105" strokeWidth="2.2" />
        {/* Central Fulcrum / Pivot Ring */}
        <circle cx="388" cy="110" r="5" strokeWidth="2" fill="#782323" fillOpacity="0.4" />
        {/* Main Horizontal Beam of the Scales */}
        <path d="M 290 120 L 388 110 L 485 105" strokeWidth="3" strokeLinecap="round" />
        <circle cx="290" cy="120" r="4" fill="#782323" />
        <circle cx="485" cy="105" r="4" fill="#782323" />

        {/* Left Scale Strings & Pan */}
        <line x1="290" y1="120" x2="265" y2="190" strokeWidth="1.2" />
        <line x1="290" y1="120" x2="290" y2="190" strokeWidth="1.2" />
        <line x1="290" y1="120" x2="315" y2="190" strokeWidth="1.2" />
        {/* Left Scale Dish Pan */}
        <path d="M 260 190 Q 290 205 320 190 Z" fill="#782323" fillOpacity="0.25" strokeWidth="2" />
        <path d="M 260 190 Q 290 215 320 190" strokeWidth="1.5" />

        {/* Right Scale Strings & Pan */}
        <line x1="485" y1="105" x2="460" y2="175" strokeWidth="1.2" />
        <line x1="485" y1="105" x2="485" y2="175" strokeWidth="1.2" />
        <line x1="485" y1="105" x2="510" y2="175" strokeWidth="1.2" />
        {/* Right Scale Dish Pan */}
        <path d="M 455 175 Q 485 190 515 175 Z" fill="#782323" fillOpacity="0.25" strokeWidth="2" />
        <path d="M 455 175 Q 485 200 515 175" strokeWidth="1.5" />

        {/* Classical Draped Robe (Torso, Bust, Girdle / Cincture) */}
        {/* Bodice / Draped neckline */}
        <path d="M 240 230 C 255 250 280 250 295 240" strokeWidth="1.8" />
        <path d="M 245 245 Q 268 265 290 250" />
        <path d="M 248 260 Q 268 280 288 265" />
        <path d="M 252 275 Q 268 290 285 280" />
        {/* High Girdle / Belt under bust */}
        <path d="M 235 295 C 260 305 285 300 305 288 L 305 298 C 285 310 260 315 235 305 Z" fill="#782323" fillOpacity="0.3" strokeWidth="1.8" />
        {/* Belt knot / brooch */}
        <circle cx="268" cy="305" r="5" strokeWidth="1.8" />

        {/* Flowing Skirt & Voluminous Drapery with Classical Cross-Hatching */}
        {/* Main vertical fold sweeps */}
        <path d="M 238 305 Q 220 380 205 470 Q 185 580 175 700 Q 168 760 165 800" strokeWidth="2" />
        <path d="M 255 310 Q 245 400 238 500 Q 230 620 228 720 Q 225 780 220 810" strokeWidth="1.8" />
        <path d="M 270 308 Q 275 420 280 530 Q 285 650 288 750 Q 290 790 292 820" strokeWidth="1.8" />
        <path d="M 290 300 Q 310 390 325 490 Q 340 600 348 710 Q 355 770 358 815" strokeWidth="2" />
        <path d="M 305 292 Q 335 365 360 455 Q 385 560 398 670 Q 408 745 415 800" strokeWidth="2.2" />

        {/* Swags, Folds & Side Cascades (Himation / Shawl) */}
        <path d="M 220 380 C 200 420 185 460 180 505 C 175 550 180 600 190 640" strokeWidth="1.4" />
        <path d="M 205 470 C 220 520 235 560 250 600 C 265 640 270 690 272 740" strokeWidth="1.3" />
        <path d="M 325 490 C 310 550 300 610 295 670 C 290 730 292 780 295 820" strokeWidth="1.3" />
        <path d="M 360 455 C 345 530 338 600 335 680 C 332 750 338 790 342 818" strokeWidth="1.3" />
        {/* Dynamic Back Shawl billowing behind legs */}
        <path d="M 390 250 Q 425 340 440 440 Q 450 560 445 680 Q 440 760 425 810" strokeWidth="2" strokeDasharray="6 2" opacity="0.6" />
        <path d="M 405 320 Q 430 420 435 520 Q 438 620 430 720" strokeWidth="1.1" strokeDasharray="4 2" opacity="0.5" />

        {/* Intricate Engraving Shading Hatch Lines */}
        <g strokeWidth="0.9" opacity="0.65">
          <line x1="240" y1="330" x2="250" y2="345" />
          <line x1="238" y1="345" x2="248" y2="360" />
          <line x1="235" y1="360" x2="245" y2="375" />
          <line x1="232" y1="375" x2="242" y2="390" />
          <line x1="228" y1="395" x2="238" y2="410" />
          <line x1="224" y1="415" x2="234" y2="430" />
          <line x1="220" y1="435" x2="230" y2="450" />
          <line x1="215" y1="460" x2="225" y2="475" />
          <line x1="210" y1="485" x2="220" y2="500" />
          <line x1="205" y1="510" x2="215" y2="525" />
          <line x1="200" y1="540" x2="210" y2="555" />
          <line x1="195" y1="570" x2="205" y2="585" />
          <line x1="190" y1="605" x2="200" y2="620" />
          <line x1="185" y1="640" x2="195" y2="655" />
          <line x1="180" y1="680" x2="190" y2="695" />

          {/* Right Drapery Shading Lines */}
          <line x1="305" y1="330" x2="315" y2="345" />
          <line x1="310" y1="350" x2="320" y2="365" />
          <line x1="318" y1="375" x2="328" y2="390" />
          <line x1="325" y1="400" x2="335" y2="415" />
          <line x1="335" y1="430" x2="345" y2="445" />
          <line x1="345" y1="465" x2="355" y2="480" />
          <line x1="355" y1="500" x2="365" y2="515" />
          <line x1="365" y1="540" x2="375" y2="555" />
          <line x1="375" y1="585" x2="385" y2="600" />
          <line x1="385" y1="630" x2="395" y2="645" />
          <line x1="395" y1="680" x2="405" y2="695" />
        </g>

        {/* Bare Feet & Classical Stone Pedestal */}
        {/* Left Foot Peeking from hem */}
        <path d="M 215 810 C 210 818 200 822 195 822 C 190 822 188 818 192 812" strokeWidth="1.6" />
        {/* Right Foot */}
        <path d="M 285 818 C 288 825 295 827 302 825 C 308 823 306 816 298 812" strokeWidth="1.6" />
        {/* Classical Multi-Tier Pedestal Base */}
        <path d="M 120 822 L 440 822 L 445 832 L 115 832 Z" fill="#782323" fillOpacity="0.2" strokeWidth="2" />
        <path d="M 100 832 L 460 832 L 470 848 L 90 848 Z" fill="#782323" fillOpacity="0.3" strokeWidth="2.2" />
        {/* Pedestal Molding Hatching */}
        <line x1="130" y1="827" x2="430" y2="827" strokeWidth="1.2" />
        <line x1="110" y1="840" x2="450" y2="840" strokeWidth="1.4" />
      </g>
    </svg>
  );
}
