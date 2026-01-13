"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebase";
import axiosInstance from "../lib/axiosInstance";

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  email: string;
  website: string;
  location: string;
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
  updateProfile: (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
  }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  googlesignin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser?.email) {
        try {
          const res = await axiosInstance.get<User>("/loggedinuser", {
            params: { email: firebaseUser.email },
          });
          if (res.data) {
            setUser(res.data);
            localStorage.setItem("twitter-user", JSON.stringify(res.data));
          }
        } catch (err: unknown) {
          console.error("Failed to fetch user:", err);
        }
      } else {
        setUser(null);
        localStorage.removeItem("twitter-user");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const usercred = await signInWithEmailAndPassword(auth, email, password);
      const firebaseuser = usercred.user;
      if (firebaseuser.email) {
        const res = await axiosInstance.get<User>("/loggedinuser", {
          params: { email: firebaseuser.email },
        });
        if (res.data) {
          setUser(res.data);
          localStorage.setItem("twitter-user", JSON.stringify(res.data));
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) console.error("Login error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => {
    setIsLoading(true);
    try {
      const usercred = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = usercred.user;

      const newUser: Partial<User> = {
        username,
        displayName,
        avatar:
          firebaseUser.photoURL ||
          "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400",
        email: firebaseUser.email || email,
        joinedDate: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        bio: "",
        location: "",
        website: "",
      };

      const res = await axiosInstance.post<User>("/register", newUser);
      if (res.data) {
        setUser(res.data);
        localStorage.setItem("twitter-user", JSON.stringify(res.data));
      }
    } catch (err: unknown) {
      if (err instanceof Error) console.error("Signup error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    await signOut(auth);
    localStorage.removeItem("twitter-user");
  };

  const updateProfile = async (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
  }) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updatedUser: User = {
        ...user,
        ...profileData,
      };
      const res = await axiosInstance.patch<User>(
        `/userupdate/${user.email}`,
        updatedUser
      );
      if (res.data) {
        setUser(updatedUser);
        localStorage.setItem("twitter-user", JSON.stringify(updatedUser));
      }
    } catch (err: unknown) {
      if (err instanceof Error) console.error("Profile update error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const googlesignin = async () => {
    setIsLoading(true);
    try {
      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      if (!firebaseUser.email) throw new Error("No email found in Google account");

      let userData: User | null = null;

      try {
        const res = await axiosInstance.get<User>("/loggedinuser", {
          params: { email: firebaseUser.email },
        });
        userData = res.data;
      } catch (err: unknown) {
        if (firebaseUser.email) {
          const newUser: Partial<User> = {
            username: firebaseUser.email.split("@")[0],
            displayName: firebaseUser.displayName || "User",
            avatar:
              firebaseUser.photoURL ||
              "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400",
            email: firebaseUser.email,
            joinedDate: new Date().toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            }),
            bio: "",
            location: "",
            website: "",
          };

          const registerRes = await axiosInstance.post<User>("/register", newUser);
          userData = registerRes.data;
        }
      }

      if (userData) {
        setUser(userData);
        localStorage.setItem("twitter-user", JSON.stringify(userData));
      } else {
        throw new Error("Login/Register failed: No user data returned");
      }
    } catch (err: unknown) {
      if (err instanceof Error) console.error("Google Sign-In Error:", err.message);
      alert((err as any)?.response?.data?.message || (err as Error).message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        updateProfile,
        logout,
        isLoading,
        googlesignin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
