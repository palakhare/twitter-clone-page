"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import Image from "next/image";

interface Author {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified?: boolean;
}

interface Tweet {
  _id: string;
  author: Author;
  content: string;
  image?: string;
  likes: number;
  retweets: number;
  comments: number;
  likedBy?: string[];
  retweetedBy?: string[];
  timestamp?: string;
}

interface TweetCardProps {
  tweet: Tweet;
}

export default function TweetCard({ tweet }: TweetCardProps) {
  const { user } = useAuth();
  const [tweetstate, settweetstate] = useState<Tweet>(tweet);

  const likeTweet = async (tweetId: string) => {
    try {
      const res = await axiosInstance.post(`/like/${tweetId}`, {
        userId: user?._id,
      });
      settweetstate(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const retweetTweet = async (tweetId: string) => {
    try {
      const res = await axiosInstance.post(`/retweet/${tweetId}`, {
        userId: user?._id,
      });
      settweetstate(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const isLiked = tweetstate.likedBy?.includes(user?._id || "");
  const isRetweet = tweetstate.retweetedBy?.includes(user?._id || "");

  return (
    <Card className="bg-black border-gray-800 border-x-0 border-t-0 rounded-none hover:bg-gray-950/50 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={tweetstate.author.avatar}
              alt={tweetstate.author.displayName}
            />
            <AvatarFallback>
              {tweetstate.author.displayName[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-bold text-white">
                {tweetstate.author.displayName}
              </span>

              {tweetstate.author.verified && (
                <div className="bg-blue-500 rounded-full p-0.5">
                  <svg
                    className="h-4 w-4 text-white fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                </div>
              )}

              <span className="text-gray-500">
                @{tweetstate.author.username}
              </span>

              <span className="text-gray-500">·</span>

              <span className="text-gray-500">
                {tweetstate.timestamp &&
                  new Date(tweetstate.timestamp).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
              </span>

              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 rounded-full hover:bg-gray-900"
                >
                  <MoreHorizontal className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
            </div>

            <div className="text-white mb-3 leading-relaxed">
              {tweetstate.content}
            </div>

            {tweetstate.image && (
              <div className="mb-3 rounded-2xl overflow-hidden">
                <Image
                  src={tweetstate.image}
                  alt="Tweet image"
                  width={600}
                  height={400}
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-between max-w-md">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 p-2 rounded-full text-gray-500">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">
                  {formatNumber(tweetstate.comments)}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  retweetTweet(tweetstate._id);
                }}
                className={`flex items-center space-x-2 p-2 rounded-full ${
                  isRetweet ? "text-green-400" : "text-gray-500"
                }`}
              >
                <Repeat2 className="h-5 w-5" />
                <span className="text-sm">
                  {formatNumber(tweetstate.retweets)}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  likeTweet(tweetstate._id);
                }}
                className={`flex items-center space-x-2 p-2 rounded-full ${
                  isLiked ? "text-red-500" : "text-gray-500"
                }`}
              >
                <Heart className="h-5 w-5" />
                <span className="text-sm">
                  {formatNumber(tweetstate.likes)}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 p-2 rounded-full text-gray-500"
              >
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
