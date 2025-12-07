// AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { loginUser, registerUser, getProfile, logoutUser, loginGoogle } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch (e) {
      console.warn("Error parsing user from localStorage:", e);
      localStorage.removeItem("user");
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // ------------------- Validar token al iniciar -------------------
  const validateToken = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { setUser(null); setLoading(false); return; }

    try {
      const profileRes = await getProfile();
      if (profileRes.success && profileRes.data) {
        setUser(profileRes.data);
        localStorage.setItem("user", JSON.stringify(profileRes.data));
      } else {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally { setLoading(false); }
  }, []);

  // ------------------- Login tradicional -------------------
  const login = async (email, password) => {
    try {
      const res = await loginUser({ email, password });

      if (!res.success) throw new Error("");

      const { user: userData, token } = res.data;

      // ⚡ Control del email verificado
      if (!userData.email_verified) {
        toast.error("Email no verificado");
        throw new Error("Email no verificado");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      toast.success("Sesión iniciada correctamente");
      return { user: userData, token };

    } catch (err) {
      // ⚡ Solo log, el toast ya se mostró si es email no verificado
      console.error("[AuthContext] Error login:", err);
      
    }
  };

  // ------------------- Login con Google -------------------
  const loginWithGoogle = async (idToken) => {
    try {
      const res = await loginGoogle(idToken);

      if (!res?.success) throw new Error(res?.error || "Error login Google");

      const { user: userData, token } = res.data.data;

     
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      toast.success("Login con Google exitoso!");
      return { user: userData, token };

    } catch (err) {
      console.error("[AuthContext] Error login Google:", err);
      throw err;
    }
  };

  // ------------------- Registro -------------------
  const register = async (data) => {
    try {
      const res = await registerUser(data);
      if (!res.success) throw new Error(res.error || "Error al registrar usuario");
      toast.success("Cuenta creada con éxito, revisa tu correo!");
      return true;
    } catch (err) {
      toast.error(err?.message || "Error al registrar usuario");
      throw err;
    }
  };

  // ------------------- Logout -------------------
  const logout = async () => {
    try { await logoutUser(); } catch {} 
    finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      toast.success("Sesión cerrada correctamente");
    }
  };

  useEffect(() => { validateToken(); }, [validateToken]);

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, register, validateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
