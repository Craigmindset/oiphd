"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState<"question" | 1 | 2 | 3 | 4>(
    "question"
  );
  const [registeringForSomeone, setRegisteringForSomeone] = useState<
    boolean | null
  >(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    occupation: "",
    expectations: "",
    healthImage: null as File | null,
    password: "",
    confirmPassword: "",
  });

  const handleQuestionAnswer = (answer: boolean) => {
    setRegisteringForSomeone(answer);
    if (answer) {
      setShowModal(true);
    } else {
      setCurrentStep(1);
    }
  };

  const handleModalBegin = () => {
    setShowModal(false);
    setCurrentStep(1);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, healthImage: e.target.files![0] }));
    }
  };

  const handleNext = () => {
    if (currentStep === 1) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(3);
    else if (currentStep === 3) setCurrentStep(4);
  };

  const handlePrevious = () => {
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 4) setCurrentStep(3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle registration submission
  };

  const getProgressPercentage = () => {
    if (currentStep === "question") return 0;
    return ((currentStep as number) / 4) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        {currentStep !== "question" && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of 4
              </span>
              <span className="text-sm font-medium text-gray-700">
                {getProgressPercentage().toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Question Page - updated to match provided image */}
        {currentStep === "question" && (
          <div className="text-center py-16 px-4">
            {/* top icon */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Image
                  src="/arklogo.png"
                  alt="OIPHD icon"
                  width={50}
                  height={50}
                  className="text-white"
                />
              </div>
            </div>

            <h1 className="text-3xl md:text-3xl font-extrabold text-gray-900 mb-3">
              Are you registering for someone?
            </h1>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
              {/* Yes Card */}
              <button
                onClick={() => handleQuestionAnswer(true)}
                className={`group relative bg-white rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-shadow duration-200 text-left flex flex-col items-center ${
                  registeringForSomeone === true ? "ring-2 ring-blue-300" : ""
                }`}
              >
                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-b from-blue-700 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                  <Image
                    src="/users-svgrepo-com.svg"
                    alt="Users icon"
                    width={40}
                    height={40}
                    className="text-white"
                  />
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    Yes
                  </div>
                  <div className="text-sm text-gray-500">
                    I am registering on behalf of someone else
                  </div>
                </div>
              </button>

              {/* No Card */}
              <button
                onClick={() => handleQuestionAnswer(false)}
                className={`group relative bg-white rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-shadow duration-200 text-left flex flex-col items-center ${
                  registeringForSomeone === false ? "ring-2 ring-blue-300" : ""
                }`}
              >
                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-b from-blue-700 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                  <Image
                    src="/single-user.svg"
                    alt="Users icon"
                    width={40}
                    height={40}
                    className="text-white"
                  />
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    No
                  </div>
                  <div className="text-sm text-gray-500">
                    I am registering for myself
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Form Steps */}
        {currentStep !== "question" && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left - Form */}
              <div className="p-8 sm:p-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1 */}
                  {currentStep === 1 && (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Personal Information
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="John"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Doe"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <RadioGroup
                          value={formData.gender}
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, gender: value }))
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male" className="cursor-pointer">
                              Male
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female" className="cursor-pointer">
                              Female
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 000-0000"
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Step 2 */}
                  {currentStep === 2 && (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Address & Occupation
                      </h2>
                      <div className="space-y-2">
                        <Label htmlFor="address">Residential Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="123 Main Street"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select a country</option>
                          <option value="US">United States</option>
                          <option value="UK">United Kingdom</option>
                          <option value="CA">Canada</option>
                          <option value="AU">Australia</option>
                          <option value="NG">Nigeria</option>
                          {/* Add more countries as needed */}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Occupation</Label>
                        <RadioGroup
                          value={formData.occupation}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              occupation: value,
                            }))
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="employed" id="employed" />
                            <Label
                              htmlFor="employed"
                              className="cursor-pointer"
                            >
                              Employed
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem
                              value="self-employed"
                              id="self-employed"
                            />
                            <Label
                              htmlFor="self-employed"
                              className="cursor-pointer"
                            >
                              Self Employed
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem
                              value="unemployed"
                              id="unemployed"
                            />
                            <Label
                              htmlFor="unemployed"
                              className="cursor-pointer"
                            >
                              Unemployed
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="student" id="student" />
                            <Label htmlFor="student" className="cursor-pointer">
                              Student
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </>
                  )}

                  {/* Step 3 */}
                  {currentStep === 3 && (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Your Expectations
                      </h2>
                      <div className="space-y-2">
                        <Label>What are your expectations?</Label>
                        <RadioGroup
                          value={formData.expectations}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              expectations: value,
                            }))
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="healing" id="healing" />
                            <Label htmlFor="healing" className="cursor-pointer">
                              Healing
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem
                              value="deliverance"
                              id="deliverance"
                            />
                            <Label
                              htmlFor="deliverance"
                              className="cursor-pointer"
                            >
                              Deliverance
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem
                              value="breakthrough"
                              id="breakthrough"
                            />
                            <Label
                              htmlFor="breakthrough"
                              className="cursor-pointer"
                            >
                              Break-through
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="spiritual" id="spiritual" />
                            <Label
                              htmlFor="spiritual"
                              className="cursor-pointer"
                            >
                              Spiritual Encounter
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="healthImage">
                          Upload Health/Medical Documents (Optional)
                        </Label>
                        <Input
                          id="healthImage"
                          type="file"
                          onChange={handleFileChange}
                          accept="image/*,.pdf"
                          className="w-full"
                        />
                      </div>
                    </>
                  )}

                  {/* Step 4 */}
                  {currentStep === 4 && (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Create Password
                      </h2>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 pt-6">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        onClick={handlePrevious}
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        Previous
                      </Button>
                    )}
                    {currentStep < 4 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Complete Registration
                      </Button>
                    )}
                  </div>
                </form>

                {/* Sign In Link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>

              {/* Right - Image */}
              <div className="hidden lg:flex bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center p-8">
                <div className="text-center text-white">
                  <div className="w-32 h-32 bg-white/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    {currentStep === 1 && "Tell Us About You"}
                    {currentStep === 2 && "Your Location"}
                    {currentStep === 3 && "Your Journey"}
                    {currentStep === 4 && "Secure Your Account"}
                  </h3>
                  <p className="text-blue-100 leading-relaxed">
                    {currentStep === 1 &&
                      "Help us understand your background and contact information."}
                    {currentStep === 2 &&
                      "Share your location and professional details."}
                    {currentStep === 3 &&
                      "Tell us what you hope to achieve through this program."}
                    {currentStep === 4 &&
                      "Create a secure password to protect your account."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Registering for Someone */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Important Information</DialogTitle>
              <DialogDescription>
                Please read the following before proceeding:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-100 text-blue-600 font-bold">
                    1
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  Ensure all inputted details are for the person in-concern
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-100 text-blue-600 font-bold">
                    2
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  Ensure the email is validated to enable login
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-100 text-blue-600 font-bold">
                    3
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  If the person is uneducated, very old, or blind, you will be
                  responsible for guiding them through text, audio, and video
                  modules
                </p>
              </div>
            </div>
            <Button
              onClick={handleModalBegin}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Begin
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
