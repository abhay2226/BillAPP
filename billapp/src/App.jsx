// import { Routes, Route, Navigate } from "react-router-dom";

// import Dashboard from "./pages/Dashboard/Dashboard";
// import Inventory from "./pages/Inventory/Inventory";
// import Voicebilling from "./pages/Voicebilling/Voicebilling";

// import "./App.css";

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Navigate to="/dashboard" replace />} />

//       <Route path="/dashboard" element={<Dashboard />} />

//       <Route path="/inventory" element={<Inventory />} />

//       <Route path="/billing" element={<Voicebilling />} />
//     </Routes>
//   );
// }

// export default App;

import { Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./components/layout/AppShell";

import Dashboard from "./pages/Dashboard/Dashboard";
import Inventory from "./pages/Inventory/Inventory";
import Voicebilling from "./pages/Voicebilling/Voicebilling";
import Profile from "./pages/Profile/Profile";
import Login, { SESSION_KEY } from "./pages/Login/login";


function App() {
  const isAuthenticated = localStorage.getItem(SESSION_KEY) === "true";

  return (
    <Routes>

      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />

      <Route path="/login" element={<Login />} />

      <Route element={isAuthenticated ? <AppShell /> : <Navigate to="/login" replace />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/inventory"
          element={<Inventory />}
        />

        <Route
          path="/billing"
          element={<Voicebilling />}
        />

        <Route
            path="/profile"
         element={<Profile />} 
         />

      </Route>

    </Routes>
  );
}

export default App;