module.exports = {
  // content: ["./views/**/*.html"],  // Make sure it watches your .html files
  content: ["./views/**/*.ejs"], // all .ejs files
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  daisyui: {
    themes: ["fantasy"], // You can customize the theme here
  },
}
