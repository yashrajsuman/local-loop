"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useLocation } from "@/contexts/location-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Upload } from "lucide-react";
import { api } from "@/lib/api";
import { categories, eventTypes } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";

// Dynamically import location picker to avoid SSR issues
const LocationPickerComponent = dynamic(
  () => import("@/components/location-picker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-gray-100 flex items-center justify-center">
        Loading map...
      </div>
    ),
  }
);

export default function SubmitPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { userLocation, locationStatus } = useLocation();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 });

  useEffect(() => {
    if (userLocation && locationStatus === "granted") {
      setLocation(userLocation);
    }
  }, [userLocation, locationStatus]);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit new content",
        variant: "destructive",
      });
      router.push("/login");
    }
  }, [user, authLoading, router, toast]);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setLocation({ lat, lng });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate) {
      toast({
        title: "Missing information",
        description: "Please select a start date",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = "/placeholder.svg?height=400&width=600";

      if (image) {
        try {
          // Use the upload API endpoint
          imageUrl = await api.uploads.uploadImage(image);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast({
            title: "Image upload failed",
            description:
              "Could not upload the image, but continuing with submission",
            variant: "destructive",
          });
        }
      }

      const newItem = {
        title,
        description,
        category: category as any,
        type: type as any,
        startDate: startDate.toISOString(),
        endDate: endDate ? endDate.toISOString() : startDate.toISOString(),
        address,
        location,
        image: imageUrl,
      };

      await api.items.create(newItem as any);

      toast({
        title: "Success!",
        description: "Your item has been submitted",
      });

      router.push("/");
    } catch (error) {
      console.error("Error submitting item:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your item",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 md:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary-900">
          Submit New Item
        </h1>
        <p className="mt-2 text-gray-600">
          Share an event or deal with your neighborhood
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-primary-800 border-b pb-2">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">
                  Item Type
                </Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about your event or deal"
                required
                className="min-h-[120px] w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-primary-800 border-b pb-2">
              Location
            </h2>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Address
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter the full address"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Pin Location on Map</Label>
              <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200">
                <LocationPickerComponent
                  initialLocation={location}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
              <p className="text-sm text-gray-500">
                Click on the map to set the exact location
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-primary-800 border-b pb-2">
              Image
            </h2>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-medium">
                Upload Image
              </Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select Image
                </Button>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <span className="text-sm text-green-600">Image selected</span>
                )}
              </div>

              {imagePreview && (
                <div className="mt-4">
                  <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-100">
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
