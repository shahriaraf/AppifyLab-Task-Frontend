import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase.init"; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Axios instance with interceptor
    const api = axios.create({ baseURL: "https://appify-lab-task-backend.vercel.app" });

    useEffect(() => {
        // Check LocalStorage on Load
        const storedToken = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setToken(res.data.token);
            setUser(res.data.user);
            toast.success("Login Successful!");
            return true;
        } catch (err) {
            toast.error(err.response?.data || "Login Failed");
            return false;
        }
    };

    const googleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const firebaseToken = await result.user.getIdToken();
            const res = await api.post("/auth/google", { token: firebaseToken });
            
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setToken(res.data.token);
            setUser(res.data.user);
            toast.success("Google Login Successful!");
            return true;
        } catch (err) {
            console.error(err);
            toast.error("Google Login Failed");
            return false;
        }
    };

    const register = async (userData) => {
        try {
            await api.post("/auth/register", userData);
            toast.success("Registration Successful! Please Login.");
            return true;
        } catch (err) {
            toast.error(err.response?.data || "Registration Failed");
            return false;
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, googleLogin, register, logout, api }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};