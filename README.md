# Placement Portal

Ek full-stack **Placement Portal** — React (frontend) + Node.js/Express (backend).
Isme 3 roles hain:

1. **Admin** — sabse pehle login karta hai, sab company aur students dekh sakta hai, company registrations ko approve/reject karta hai, aur dekh sakta hai ke kaunsa student kis company mein approve hua hai.
2. **Company** — register + login karke apni details aur "student requirements" daalti hai. Admin approve karne ke baad hi wo student applicants dekh/approve kar sakti hai.
3. **Student** — register + login karke apni profile (course, branch, CGPA, skills) fill karta hai, resume PDF upload karta hai, aur approved companies mein apply karta hai.

Data ek simple JSON file (`backend/data/db.json`) mein store hota hai — isliye MongoDB/MySQL install karne ki zaroorat nahi hai. Resume PDFs `backend/uploads/` folder mein save hote hain.

---

## Folder Structure

```
placement-portal/
├── backend/          # Express API + JSON file database
│   ├── config/       # db.js - JSON file read/write helper
│   ├── middleware/    # auth.js (JWT), upload.js (multer for PDF)
│   ├── models/        # db.js - CRUD helper functions
│   ├── routes/        # authRoutes, adminRoutes, companyRoutes, studentRoutes
│   ├── utils/         # seedAdmin.js - admin account banane ke liye
│   ├── uploads/        # uploaded resume PDFs yahan save hote hain
│   ├── data/           # db.json - saara data yahan store hota hai
│   ├── .env.example
│   └── server.js
└── frontend/          # React + Vite app
    └── src/
        ├── api/        # axios instance
        ├── context/    # AuthContext (login state)
        ├── components/ # Navbar, ProtectedRoute
        └── pages/       # Login, Register, Home, admin/, company/, student/
```

---

## Requirement (pehle install karo)

- **Node.js** (v18 ya usse upar) — [https://nodejs.org](https://nodejs.org) se download kar sakte ho.
- Node install hone ke saath `npm` bhi aa jaata hai.

Check karne ke liye terminal/cmd mein:
```bash
node -v
npm -v
```

---

## Step 1 — Backend Setup

```bash
cd placement-portal/backend
npm install
```

`.env` file already bani hui hai (`.env.example` se copy ki hui). Agar chaho to values change kar sakte ho:

```
PORT=5000
JWT_SECRET=placement_portal_super_secret_key_change_me
ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@placementportal.com
ADMIN_PASSWORD=Admin@123
```

Ab **Admin account banane** ke liye ye command ek baar chalao (ye seed script hai, admin registration form se nahi banta — security ke liye):

```bash
npm run seed
```

Isse terminal mein admin ka email/password print hoga. Yehi credentials use karke admin login karega.

Ab backend server start karo:

```bash
npm start
```

Ye chalega: `http://localhost:5000`
Check karne ke liye browser mein kholo: `http://localhost:5000/api/health` — `{"status":"ok"}` dikhna chahiye.

(Development ke liye auto-restart chahiye to `npm run dev` use karo — nodemon install hai.)

---

## Step 2 — Frontend Setup

Naya terminal kholo (backend wala chalta rehne do):

```bash
cd placement-portal/frontend
npm install
npm run dev
```

Terminal mein ek URL dikhega, usually: `http://localhost:5173`
Browser mein wo URL kholo — website chalu ho jayegi.

Frontend automatically backend se baat karta hai (Vite proxy config already set hai, `/api` aur `/uploads` requests `localhost:5000` par forward hoti hain).

---

## Step 3 — Use karna

1. **Admin login**: `http://localhost:5173/login` par jao aur seed script se mile email/password se login karo. Admin dashboard mein 4 tabs milenge — Overview, Companies, Students, Applications.
2. **Company register**: "Register" par jao, "Company" role choose karo, form fill karo. Login hone ke baad "pending" status dikhega — jab tak admin approve na kare, company ko applicants nahi milenge.
3. Admin dashboard ke "Companies" tab mein jaake us company ko **Approve** karo.
4. **Student register**: "Register" → "Student" role choose karo. Login karke profile fill karo aur resume (PDF) upload karo.
5. Student "Browse Companies" tab mein approved companies dekh sakta hai aur **Apply** kar sakta hai.
6. Company dashboard ke "Applicants" section mein us student ko **Approve/Reject** kar sakti hai.
7. Admin "Applications" tab mein dekh sakta hai ke kaunsa student kis company mein approve/pending/rejected hai.

---

## Common Issues

- **"Port already in use"**: `.env` mein `PORT` value change kar do (backend ke liye), ya frontend ke liye `vite.config.js` mein port change karo.
- **Resume upload fail ho raha hai**: sirf `.pdf` files allowed hain, max size 5MB.
- **Login nahi ho raha**: pehle backend chal raha hai ye confirm karo (`npm start` backend folder mein), aur `npm run seed` admin ke liye chala liya hai ye check karo.
- **Data delete karna ho / fresh start chahiye**: `backend/data/db.json` file ko delete kar do (ya andar ka content `{"users":[],"companies":[],"students":[],"applications":[]}` kar do) aur `backend/uploads/` folder khali kar do, phir `npm run seed` dubara chalao.

---

## Production Note

Ye setup development/demo ke liye JSON-file database use karta hai — chhote scale placement drives ke liye bilkul theek hai. Agar aage bade scale (bohot zyada students/companies) par deploy karna ho, to `backend/models/db.js` ko replace karke MongoDB ya PostgreSQL jaisa real database use karna better rahega — baaki poora code (routes, auth, frontend) waise ka waisa reuse ho jayega.
