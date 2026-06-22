/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: { ink: '#26332d', cream: '#f7f5f0', sage: { 50:'#f0f5f1',100:'#e1ebe3',400:'#7fa28a',500:'#678b72',700:'#46604e' }, rose: { 50:'#fbf2f1',400:'#c88f88',500:'#b9756d' } },
    fontFamily: { sans: ['Inter','ui-sans-serif','system-ui'], display: ['Fraunces','Georgia','serif'] },
    boxShadow: { card: '0 1px 2px rgba(30,45,36,.04), 0 10px 30px rgba(52,70,59,.06)' }
  }},
  plugins: []
}
