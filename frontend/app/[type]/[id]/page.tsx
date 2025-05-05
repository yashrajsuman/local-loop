"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Heart,
  Share2,
} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";

// Dynamically import map component to avoid SSR issues
const DetailMapComponent = dynamic(() => import("@/components/detail-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-gray-100 flex items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const data = await api.items.getById(params.id as string);
        console.log("Item data received:", data);
        setItem(data);
      } catch (error) {
        console.error("Error fetching item:", error);
        toast({
          title: "Error",
          description: "Failed to load item details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchItem();
    }
  }, [params.id, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleFavorite = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save items to favorites",
        variant: "default",
      });
      return;
    }

    toast({
      title: "Added to favorites",
      description: "This item has been added to your favorites",
      variant: "default",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item?.title,
        text: item?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Item link copied to clipboard",
        variant: "default",
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading item details...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Item not found</h2>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex flex-col gap-8">
        {/* Top section with image and basic info */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-md">
            <Image
              src={
                item.image
                  ? `http://localhost:8000${item.image}`
                  : "/placeholder.svg"
              }
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <div className="flex items-start justify-between">
              <div>
                <Badge
                  className={`${
                    item.type === "event" ? "bg-primary-600" : "bg-green-600"
                  } mb-2`}
                >
                  {item.type === "event" ? "Event" : "Deal"}
                </Badge>
                <Badge variant="outline" className="ml-2">
                  {item.category}
                </Badge>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={handleFavorite}>
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <h1 className="text-3xl font-bold mt-4">{item.title}</h1>

            <div className="flex items-center mt-4 text-gray-600">
              <Calendar className="h-5 w-5 mr-2 text-primary-600" />
              <div>
                <div>{formatDate(item.startDate)}</div>
                {item.endDate && item.endDate !== item.startDate && (
                  <div>to {formatDate(item.endDate)}</div>
                )}
              </div>
            </div>

            <div className="flex items-center mt-4 text-gray-600">
              <MapPin className="h-5 w-5 mr-2 text-primary-600" />
              <span>{item.address}</span>
            </div>

            <div className="mt-6 text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                Posted on {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Description section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {item.description}
          </p>
        </div>

        {/* Map section - full width */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Location</h2>
          <div className="h-[400px] rounded-lg overflow-hidden">
            {/* Log the data being passed to DetailMapComponent */}
            {(() => {
              console.log("Rendering DetailMapComponent with:", {
                location: item.location,
                address: item.address,
              });
              return null;
            })()}
            <DetailMapComponent
              location={item.location}
              address={item.address}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
