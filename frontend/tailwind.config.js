/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		colors: {
			"darkblue": "#4335A7",
			"lightblue": "#80C4E9",
			"lightorange": "#FFF6E9",
			"darkorange": "#FF7F3E",
  		},
		width: {
			"100": "25rem",
			"104": "26rem",
			"108": "27rem",
			"112": "28rem",
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
