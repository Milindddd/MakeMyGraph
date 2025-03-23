import React from "react";

const AboutUs = () => {
  return (
    <div className="bg-gray-100 text-gray-800">
      {/* Hero Section */}
      <section className="text-center py-16 bg-blue-600 text-white">
        <h1 className="text-4xl font-bold">About Us</h1>
        <p className="text-lg mt-4 px-6">
          We are passionate about building interactive and dynamic graphs to help users visualize data effectively.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto py-12 px-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold text-blue-600">Our Mission</h2>
            <p className="mt-4 text-gray-600">
              Our mission is to empower individuals and businesses with easy-to-use, high-quality graph visualization tools.
            </p>
          </div>
          <div className="bg-white p-6 shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold text-blue-600">Our Vision</h2>
            <p className="mt-4 text-gray-600">
              We envision a future where data is effortlessly understood through beautiful and interactive graphs.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-200 py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800">Meet the Team</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            {/* Team Member */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <img
                src="https://via.placeholder.com/150"
                alt="Team Member"
                className="w-24 h-24 mx-auto rounded-full"
              />
              <h3 className="text-xl font-semibold mt-4">John Doe</h3>
              <p className="text-gray-600">Frontend Developer</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <img
                src="https://via.placeholder.com/150"
                alt="Team Member"
                className="w-24 h-24 mx-auto rounded-full"
              />
              <h3 className="text-xl font-semibold mt-4">Jane Smith</h3>
              <p className="text-gray-600">Backend Developer</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <img
                src="https://via.placeholder.com/150"
                alt="Team Member"
                className="w-24 h-24 mx-auto rounded-full"
              />
              <h3 className="text-xl font-semibold mt-4">Mike Johnson</h3>
              <p className="text-gray-600">UI/UX Designer</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
