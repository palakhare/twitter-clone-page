"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth } from "./firebase";
import axiosInstance from "../lib/axiosInstance";

/* ===================== TYPES ===================== */

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  email: string;
  bio?: string;
  joinedDate?: string;
  website?: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => Promise<void>;
  googlesignin: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

/* ===================== CONTEXT ===================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};

/* ===================== PROVIDER ===================== */

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ===================== SESSION HANDLING ===================== */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser?.email) {
          const res = await axiosInstance.get("/loggedinuser", {
            params: { email: firebaseUser.email },
          });

          if (res.data) {
            setUser(res.data);
            localStorage.setItem("twitter-user", JSON.stringify(res.data));
          }
        } else {
          setUser(null);
          localStorage.removeItem("twitter-user");
        }
      } catch (err) {
        console.error("Session restore failed:", err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /* ===================== EMAIL LOGIN ===================== */

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      const res = await axiosInstance.get("/loggedinuser", {
        params: { email: cred.user.email },
      });

      if (!res.data) {
        throw new Error("User not found in database");
      }

      setUser(res.data);
      localStorage.setItem("twitter-user", JSON.stringify(res.data));
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================== SIGNUP ===================== */

  const signup = async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => {
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const res = await axiosInstance.post("/register", {
        username,
        displayName,
        email: cred.user.email,
        avatar:
          cred.user.photoURL ||
          "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg",
      });

      setUser(res.data);
      localStorage.setItem("twitter-user", JSON.stringify(res.data));
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================== GOOGLE SIGN IN ===================== */

  const googlesignin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      if (!email) {
        throw new Error("Google account has no email");
      }

      let userData: User;

      try {
        const res = await axiosInstance.get("/loggedinuser", {
          params: { email },
        });
        userData = res.data;
      } catch {
        const registerRes = await axiosInstance.post("/register", {
          username: email.split("@")[0],
          displayName: result.user.displayName || "User",
          email,
          avatar:
            result.user.photoURL ||
            "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg",
        });
        userData = registerRes.data;
      }

      if (!userData) {
        throw new Error("Login/Register failed: No user data returned");
      }

      setUser(userData);
      localStorage.setItem("twitter-user", JSON.stringify(userData));
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      alert(err.message || "Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================== UPDATE PROFILE ===================== */

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const res = await axiosInstance.patch(
        `/userupdate/${user.email}`,
        data
      );

      setUser(res.data);
      localStorage.setItem("twitter-user", JSON.stringify(res.data));
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================== LOGOUT ===================== */

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem("twitter-user");
  };

  /* ===================== PROVIDER ===================== */

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        googlesignin,
        updateProfile,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
