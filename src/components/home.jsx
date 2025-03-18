import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <motion.h1
        className="text-4xl font-bold text-gray-800 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Welcome to MakeMyGraph 📊
      </motion.h1>
      
      <p className="text-lg text-gray-600 mb-6 text-center">
        Easily generate customizable graphs based on your data.
      </p>

      <Card className="p-6 shadow-lg max-w-md bg-white">
        <CardContent className="flex flex-col gap-4">
          <Button asChild className="w-full">
            <Link to="/generate">Create a Graph</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/about">Learn More</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
