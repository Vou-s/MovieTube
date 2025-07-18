
# 🎬 MovieTube - Angular OMDB App

Aplikasi film menggunakan Angular Standalone dengan OMDB API (Open Movie Database).

## 🚀 Setup Project

### 1. Prerequisites
```bash
node -v  # >= 18.x.x
npm -v   # >= 9.x.x
ng version  # Angular CLI >= 17.x.x
```

### 2. Install Angular CLI
```bash
npm install -g @angular/cli@latest
```

### 3. Create Project
```bash
ng new MovieTube --standalone --routing=false --style=css
cd MovieTube
```

### 4. Copy Files
- Copy semua kode dari artifact ini ke dalam project
- Pastikan structure folder sesuai:
```
src/
├── app/
│   ├── components/
│   │   ├── header/
│   │   ├── movie-card/
│   │   └── movie-list/
│   ├── interfaces/
│   ├── services/
│   └── app.component.ts
├── environments/
└── main.ts
```

## 🔑 OMDB API Setup (100% GRATIS)

### 1. Daftar OMDB API
1. Kunjungi: http://www.omdbapi.com/apikey.aspx
2. Pilih **"FREE!" (1,000 daily limit)**
3. Isi form:
   - Email: email@anda.com
   - First Name: Nama Anda
   - Last Name: Nama Keluarga
   - **Use**: Select "Educational" atau "Personal"
4. Klik **"Submit"**
5. Check email untuk aktivasi
6. Klik link aktivasi di email
7. **Copy API Key** yang diberikan

### 2. Setup API Key
Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  omdbApiKey: 'YOUR_API_KEY_HERE', // Paste API key disini
  omdbBaseUrl: 'https://www.omdbapi.com',
  placeholder: 'https://via.placeholder.com/300x450/333333/ffffff?text=No+Poster'
};
```

## 🏃‍♂️ Run Application

```bash
# Development server
ng serve

# Open browser
http://localhost:4200
```

## 📊 OMDB API Features

### ✅ Yang Tersedia Gratis:
- **1,000 requests/hari** (reset setiap 24 jam)
- Search film berdasarkan judul
- Detail lengkap film (plot, rating, cast, dll)
- Poster berkualitas tinggi
- Rating dari IMDB
- Informasi produksi
- **Tanpa watermark**
- **Unlimited API keys**

### 🎯 API Endpoints yang Digunakan:
```typescript
// Search movies
http://www.omdbapi.com/?apikey=YOUR_KEY&s=batman&type=movie

// Get movie detail  
http://www.omdbapi.com/?apikey=YOUR_KEY&i=tt0372784&plot=full

// Search by title
http://www.omdbapi.com/?apikey=YOUR_KEY&t=inception&y=2010
```

## 🔧 App Features

### 🎬 Core Features:
- **Search Film** - Pencarian real-time dengan debounce
- **Kategori Film** - Popular, Action, Comedy, Drama, dll
- **Film Trending** - Kombinasi dari beberapa kategori populer
- **Detail Film** - Info lengkap dengan modal
- **Responsive Design** - Mobile-first approach

### 🚀 Technical Features:
- **Angular 17+ Standalone** - Modern Angular architecture
- **RxJS Observables** - Reactive programming
- **Error Handling** - Fallback ke sample data
- **Loading States** - UX yang smooth
- **TypeScript** - Type safety
- **CSS Grid** - Modern layout

## 📱 Responsive Design

- **Desktop**: Grid 4-5 kolom
- **Tablet**: Grid 2-3 kolom  
- **Mobile**: Grid 1-2 kolom
- **Header responsif** dengan search collapsible

## 🎨 UI/UX Features

- **Dark Theme** ala YouTube/Netflix
- **Smooth Animations** - Hover effects
- **Loading Spinners** - Visual feedback
- **Error States** - User-friendly messages
- **Gradient Buttons** - Modern design
- **Card Interactions** - Hover transforms

## 🔍 Troubleshooting

### API Key Issues:
```bash
# Check API key validity
curl "http://www.omdbapi.com/?apikey=YOUR_KEY&i=tt0111161"

# Should return Shawshank Redemption data
```

### Common Problems:
1. **"Invalid API key"** - Cek environment.ts
2. **"Movie not found"** - Search term tidak valid
3. **CORS Error** - OMDB supports CORS by default
4. **Rate limit** - Wait 24 hours atau upgrade plan

## 🚀 Production Deployment

### Build untuk Production:
```bash
ng build --configuration production
```

### Deploy ke Netlify:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build dan deploy
ng build --prod
netlify deploy --prod --dir=dist/movie-tube
```

### Deploy ke Vercel:
```bash
npm install -g vercel
vercel --prod
```

### Environment Variables:
Set di hosting platform:
- `OMDB_API_KEY`: Your OMDB API key
- `NODE_ENV`: production

## 📊 Performance Tips

1. **Image Loading**: Lazy loading implemented
2. **API Calls**: Debounced search (500ms)
3. **Bundle Size**: Tree-shaking enabled
4. **Caching**: Browser cache untuk images
5. **Error Boundary**: Graceful degradation

## 🔮 Future Enhancements

- [ ] Add routing untuk detail pages
- [ ] Implement infinite scroll
- [ ] Add favorites/watchlist
- [ ] Movie trailers integration
- [ ] Advanced filters (year, genre, rating)
- [ ] PWA support
- [ ] Dark/light theme toggle

## 📞 Support

**OMDB API Documentation**: http://www.omdbapi.com/
**Angular Documentation**: https://angular.io/
**Issues**: Create GitHub issue untuk bug reports

---

🎬 **Happy Coding!** Nikmati aplikasi film Anda dengan OMDB API gratis!
