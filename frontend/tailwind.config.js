export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 10px 35px rgba(0, 0, 0, 0.12)',
      },
      backgroundImage: {
        hero: "url('https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1600&q=80')",
      },
    },
  },
  plugins: [],
};
