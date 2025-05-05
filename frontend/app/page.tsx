import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Tag, Search, Users, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-blue-800 text-white">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/localloop.jpg"
            alt="Neighborhood events"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/70 to-primary-700/70" />
        </div>

        {/* Centered Content */}
        <div className="container relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            Discover What's Happening in Your Neighborhood
          </h1>
          <p className="text-lg md:text-2xl mb-8 text-white/90 max-w-2xl">
            Find local events and deals near you. Connect with your community
            and never miss out on what's happening around you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/events">
              <Button
                size="lg"
                className="bg-white text-primary-700 hover:bg-white/90 rounded-full px-8 shadow-md"
              >
                Explore Events
              </Button>
            </Link>
            <Link href="/deals">
              <Button
                size="lg"
                className="bg-white text-primary-700 hover:bg-white/90 rounded-full px-8 shadow-md"
              >
                Find Deals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - card overlay on subtle blue shade */}
      <section className="py-20 bg-blue-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              NeighborHub brings your community together by making local events
              and deals easily accessible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* (Repeat feature cards as before) */}
            {[
              {
                icon: MapPin,
                title: "Discover Nearby",
                text: "Find events and deals happening right in your neighborhood with our interactive map view.",
              },
              {
                icon: Calendar,
                title: "Stay Updated",
                text: "Never miss out on local happenings with our comprehensive calendar of events.",
              },
              {
                icon: Tag,
                title: "Exclusive Deals",
                text: "Access special offers and discounts from local businesses in your community.",
              },
              {
                icon: Search,
                title: "Smart Filtering",
                text: "Find exactly what you're looking for with our powerful search and filtering options.",
              },
              {
                icon: Users,
                title: "Community Focused",
                text: "Connect with neighbors and local businesses to build a stronger community.",
              },
              {
                icon: TrendingUp,
                title: "Share & Promote",
                text: "Easily share events or create your own to promote local activities.",
              },
            ].map(({ icon: Icon, title, text }, idx) => (
              <div key={idx} className="group">
                <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 h-full">
                  <div className="rounded-full bg-blue-100 p-4 mb-4 group-hover:bg-blue-200 transition-colors">
                    <Icon className="h-8 w-8 text-primary-700" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {title}
                  </h3>
                  <p className="text-gray-600 text-center">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started with LocalLoop is easy. Find what's happening
              around you in just a few steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Browse Events & Deals",
                desc: "Explore what's happening in your area using our list or map view.",
              },
              {
                step: 2,
                title: "Find What Interests You",
                desc: "Use filters to narrow down events and deals by category, date, or location.",
              },
              {
                step: 3,
                title: "Join or Save",
                desc: "Attend events, redeem deals, or save them for later. Share with friends and family.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex flex-col items-center text-center bg-white p-6 rounded-xl shadow-sm"
              >
                <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-primary-700 text-white text-xl font-bold">
                  {step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/events">
              <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-700 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Discover Your Neighborhood?
            </h2>
            <p className="text-xl mb-8">
              Join thousands of neighbors finding the best local events and
              deals every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-white/90 rounded-full px-8 shadow-md"
                >
                  Sign Up Free
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-white/90 rounded-full px-8 shadow-md"
                >
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
