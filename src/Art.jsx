import React from "react";
export function ProductArt({ product: p, hero = false }) {
  const c = p.color;
  return (
    <svg
      className={"product-art " + (hero ? "hero-product" : "")}
      viewBox="0 0 200 210"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={"shade-" + p.id} x1="0" x2="1">
          <stop stopColor="#fff" stopOpacity=".5" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".12" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="186" rx="48" ry="8" fill="#283e2f" opacity=".09" />
      {["rice", "chips", "biscuit"].includes(p.art) ? (
        <>
          <path d="M57 35 L141 35 L151 178 Q102 188 49 178 Z" fill={c} />
          <path
            d="M57 35 L141 35 L151 178 Q102 188 49 178 Z"
            fill={"url(#shade-" + p.id + ")"}
          />
          <path
            d="M58 40H141 M51 174H150"
            stroke="#fff"
            strokeOpacity=".35"
            strokeWidth="3"
          />
          <path
            d="M54 87Q100 69 145 86L148 139Q102 148 51 137Z"
            fill="#faf7ec"
          />
          <text
            x="100"
            y="108"
            textAnchor="middle"
            fill={c}
            fontSize="15"
            fontWeight="800"
          >
            {p.brandEn}
          </text>
          <text
            x="100"
            y="126"
            textAnchor="middle"
            fill="#7f806d"
            fontSize="7"
            letterSpacing="1.5"
          >
            PREMIUM QUALITY
          </text>
          {p.art === "rice" ? (
            <g fill="#f7f0dd" transform="translate(91 51)">
              <ellipse rx="3" ry="10" transform="rotate(-30)" />
              <ellipse cx="12" cy="7" rx="3" ry="10" transform="rotate(15)" />
            </g>
          ) : (
            <circle cx="100" cy="155" r="11" fill="#fff" opacity=".5" />
          )}
        </>
      ) : ["oil", "water", "soap"].includes(p.art) ? (
        <>
          <path
            d="M84 29H116V51Q116 59 131 70Q138 76 138 93V171Q138 183 126 184H74Q62 183 62 171V93Q62 77 69 70Q84 59 84 51Z"
            fill={c}
            opacity={p.art === "water" ? 0.55 : 1}
          />
          <path
            d="M84 29H116V51Q116 59 131 70Q138 76 138 93V171Q138 183 126 184H74Q62 183 62 171V93Q62 77 69 70Q84 59 84 51Z"
            fill={"url(#shade-" + p.id + ")"}
          />
          <rect
            x="81"
            y="23"
            width="38"
            height="19"
            rx="4"
            fill={p.art === "oil" ? "#577751" : c}
          />
          <rect x="62" y="95" width="76" height="55" rx="2" fill="#fcfaf0" />
          <circle cx="100" cy="110" r="7" fill={c} />
          <text
            x="100"
            y="132"
            textAnchor="middle"
            fill="#50624c"
            fontSize="12"
            fontWeight="800"
          >
            {p.brandEn}
          </text>
          <path
            d="M73 78V164"
            stroke="white"
            strokeOpacity=".4"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {p.art === "water" && (
            <path
              d="M65 158H135M65 168H135M65 82H135"
              stroke="#fff"
              strokeOpacity=".5"
              strokeWidth="3"
            />
          )}
        </>
      ) : ["milk", "juice"].includes(p.art) ? (
        <>
          <path d="M63 57L82 27H128L143 55V181H63Z" fill="#faf5e7" />
          <path d="M128 27L143 55V181H126V57L111 42Z" fill="#d8d9ca" />
          <path d="M63 57H126V94H63Z" fill={c} />
          <path d="M63 152H126V181H63Z" fill={c} />
          <path d="M82 27H128L111 42H72Z" fill={c} />
          <text
            x="96"
            y="79"
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="800"
          >
            {p.brandEn}
          </text>
          <text
            x="96"
            y="116"
            textAnchor="middle"
            fill="#52634b"
            fontSize="10"
            fontWeight="700"
          >
            {p.art === "milk" ? "FRESH MILK" : "ORANGE"}
          </text>
          <circle
            cx="95"
            cy="136"
            r="10"
            fill={p.art === "milk" ? "#d5e4eb" : "#eda73d"}
          />
          <path
            d="M82 30V50"
            stroke="white"
            strokeOpacity=".4"
            strokeWidth="4"
          />
        </>
      ) : p.art === "tub" ? (
        <>
          <path d="M46 90H154L142 173Q100 184 58 173Z" fill="#faf8ed" />
          <path d="M49 108H151L146 148Q100 162 54 148Z" fill={c} />
          <ellipse cx="100" cy="89" rx="56" ry="16" fill={c} />
          <ellipse cx="100" cy="85" rx="54" ry="13" fill="#d8e1d1" />
          <ellipse cx="100" cy="84" rx="42" ry="8" fill="#f9f7eb" />
          <text
            x="100"
            y="134"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="700"
          >
            {p.brandEn}
          </text>
        </>
      ) : (
        <>
          <rect x="67" y="44" width="66" height="139" rx="12" fill={c} />
          <rect
            x="67"
            y="44"
            width="66"
            height="139"
            rx="12"
            fill={"url(#shade-" + p.id + ")"}
          />
          <ellipse cx="100" cy="46" rx="32" ry="7" fill="#dddccf" />
          <ellipse cx="100" cy="45" rx="25" ry="4" fill="#b8bcae" />
          <path d="M69 96Q100 78 131 94V139Q100 155 69 139Z" fill="#f8f4df" />
          <text
            x="100"
            y="116"
            textAnchor="middle"
            fill={c}
            fontSize="12"
            fontWeight="800"
          >
            {p.brandEn}
          </text>
          <text
            x="100"
            y="130"
            textAnchor="middle"
            fill="#99917b"
            fontSize="6"
            letterSpacing="1"
          >
            NATURALLY GOOD
          </text>
          <path
            d="M77 59V164"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".3"
          />
        </>
      )}
    </svg>
  );
}
export function MarketArt({ products, ar = true }) {
  return (
    <div className="market-art" aria-hidden="true">
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <span className="art-star star-one">✳</span>
      <span className="art-star star-two">✳</span>
      <div className="art-floor" />
      <div className="crate">
        <div className="crate-face">
          <span>blendomi</span>
          <i>GOOD BUSINESS STARTS HERE</i>
        </div>
        <div className="crate-side" />
      </div>
      <div className="art-item art-rice">
        <ProductArt product={products[0]} hero />
      </div>
      <div className="art-item art-oil">
        <ProductArt product={products[1]} hero />
      </div>
      <div className="art-item art-water">
        <ProductArt product={products[2]} hero />
      </div>
      <div className="art-item art-juice">
        <ProductArt product={products[4]} hero />
      </div>
      <div className="floating-label">
        <span>↗</span>
        <div>
          {ar ? "من المصدر، لمتجرك" : "From source to shop"}
          <small>LOCAL SUPPLY. BIG POSSIBILITIES.</small>
        </div>
      </div>
      <div className="art-sticker">
        100%
        <small>
          FOR YOUR
          <br />
          BUSINESS
        </small>
      </div>
    </div>
  );
}
