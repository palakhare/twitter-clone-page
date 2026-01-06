
"use client";

import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  Image as ImageIcon,
  Smile,
  Calendar,
  MapPin,
  BarChart3,
  Globe,
  X,
} from "lucide-react";
import { Separator } from "./ui/separator";
import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";

const IMGBB_API_KEY = "97f3fb960c3520d6a88d7e29679cf96f";

const TweetComposer = ({ onTweetPosted }: any) => {
  const { user } = useAuth();

  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const maxLength = 200;

  if (!user) return null;

  // ================= BASE64 IMAGE UPLOAD =================
  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setIsLoading(true);

    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const base64Image = (reader.result as string).split(",")[1];

        const res = await axios.post(
          "https://api.imgbb.com/1/upload",
          {
            image: base64Image,
          },
          {
            params: {
              key: IMGBB_API_KEY,
            },
          }
        );

        const url = res.data?.data?.display_url;
        if (url) setImageUrl(url);
      } catch (error: any) {
        console.error(
          "Image upload failed:",
          error.response?.data || error
        );
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // ================= POST TWEET =================
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!content.trim()) return;

  try {
    const tweetData = {
      author: user._id,
      content,
      image: "https://images.unsplash.com/photo-1507149833265-60c372daea22",
    };

    const res = await axiosInstance.post("/post", tweetData);
    onTweetPosted(res.data);

    setContent("");
    setImageUrl("");
  } catch (error) {
    console.error("Tweet post failed:", error);
  }
};


  return (
    <Card className="bg-black border-gray-800 border-x-0 border-t-0 rounded-none">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-transparent border-none text-xl text-white resize-none min-h-[120px]"
              />

              {/* IMAGE PREVIEW */}
              {imageUrl && (
                <div className="relative mt-3">
                  <img
                    src={imageUrl}
                    alt="preview"
                    className="rounded-xl max-h-[450px] w-full object-cover border border-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 bg-black/70 p-1 rounded-full"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4 text-blue-400">
                  <label className="cursor-pointer p-2 rounded-full hover:bg-blue-900/20">
                    <ImageIcon className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handlePhotoUpload}
                      disabled={isLoading}
                    />
                  </label>

                  <BarChart3 className="h-5 w-5" />
                  <Smile className="h-5 w-5" />
                  <Calendar className="h-5 w-5" />
                  <MapPin className="h-5 w-5" />
                </div>

                <div className="flex items-center space-x-3">
                  <Separator orientation="vertical" className="h-6 bg-gray-700" />

                  <Button
                    type="submit"
                    disabled={isLoading || (!content.trim() && !imageUrl)}
                    className="bg-blue-500 hover:bg-blue-600 rounded-full px-6"
                  >
                    {isLoading ? "Uploading..." : "Post"}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-2 text-blue-400 text-sm">
                <Globe className="h-4 w-4" />
                <span>Everyone can reply</span>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TweetComposer;
