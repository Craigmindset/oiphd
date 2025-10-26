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
import Select from "react-select";
import countries from "world-countries";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

const countryOptions = countries.map((country) => ({
  value: country.cca2,
  label: country.name.common,
}));

export default function SignupPage() {
  const router = useRouter();
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
    status: "pending",
    registeringForSomeone: null as boolean | null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuestionAnswer = (answer: boolean) => {
    setRegisteringForSomeone(answer);
    setFormData((prev) => ({ ...prev, registeringForSomeone: answer }));
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

  const handleSignup = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setErrorMessage(authError.message || "Signup failed. Please try again.");
      setIsSubmitting(false);
      return false;
    }

    // 2. Insert profile data (after successful signup)
    const user = authData.user;
    if (user) {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert([
          {
            id: user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            gender: formData.gender,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            country: formData.country,
            occupation: formData.occupation,
            expectations: formData.expectations,
            status: formData.status,
            registering_for_someone:
              formData.registeringForSomeone === true
                ? "yes"
                : formData.registeringForSomeone === false
                ? "no"
                : null,
            // health_image_url: ... (handle upload separately if needed)
          },
        ]);
      if (profileError) {
        setErrorMessage(
          profileError.message || "Profile save failed. Please try again."
        );
        setIsSubmitting(false);
        return false;
      }
      setSuccessMessage("Registration successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      setIsSubmitting(false);
      return true;
    }
    setErrorMessage("Signup failed. Please try again.");
    setIsSubmitting(false);
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);
    const result = await handleSignup();
    setIsSubmitting(false);
    if (!result) {
      // Optionally scroll to error or focus
    }
  };

  const getProgressPercentage = () => {
    if (currentStep === "question") return 0;
    return ((currentStep as number) / 4) * 100;
  };

  // Validation for each step
  const isStepValid = () => {
    if (currentStep === 1) {
      return (
        formData.firstName.trim() !== "" &&
        formData.lastName.trim() !== "" &&
        formData.gender.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.phone.trim() !== ""
      );
    }
    if (currentStep === 2) {
      return (
        formData.address.trim() !== "" &&
        formData.country.trim() !== "" &&
        formData.occupation.trim() !== ""
      );
    }
    if (currentStep === 3) {
      return formData.expectations.trim() !== "";
    }
    if (currentStep === 4) {
      return (
        formData.password.trim().length >= 6 &&
        formData.password.trim().length <= 15 &&
        formData.confirmPassword.trim().length >= 6 &&
        formData.confirmPassword.trim().length <= 15 &&
        formData.password === formData.confirmPassword
      );
    }
    return false;
  };

  // Only allow numeric input for phone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, phone: numericValue }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="w-full max-w-7xl min-h-[540px] flex flex-col justify-center bg-white rounded-xl shadow-lg p-8">
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
                <div className="w-12 h-12 md:w-20 md:h-20 bg-gradient-to-b from-blue-700 to-blue-500 rounded-xl flex items-center justify-center mb-4 md:mb-6">
                  <Image
                    src="/users-svgrepo-com.svg"
                    alt="Users icon"
                    width={28}
                    height={28}
                    className="text-white mx-auto block md:w-10 md:h-10 w-7 h-7"
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
                <div className="w-12 h-12 md:w-20 md:h-20 bg-gradient-to-b from-blue-700 to-blue-500 rounded-xl flex items-center justify-center mb-4 md:mb-6">
                  <Image
                    src="/single-user.svg"
                    alt="Users icon"
                    width={28}
                    height={28}
                    className="text-white mx-auto block md:w-10 md:h-10 w-7 h-7"
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
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
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
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Step 2 */}
                  {currentStep === 2 && (
                    <>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                        Address & Occupation
                      </h2>
                      <div className="space-y-2">
                        <Label htmlFor="address">Residential Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Your address"
                          required
                          className="w-full max-w-full px-5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                          id="country"
                          name="country"
                          options={countryOptions}
                          value={
                            countryOptions.find(
                              (option) => option.value === formData.country
                            ) || null
                          }
                          onChange={(option) =>
                            setFormData((prev) => ({
                              ...prev,
                              country: option ? option.value : "",
                            }))
                          }
                          placeholder="Select a country"
                          isClearable
                          classNamePrefix="react-select"
                          styles={{
                            control: (base) => ({
                              ...base,
                              minWidth: "100%",
                              width: "100%",
                              paddingLeft: 8,
                              paddingRight: 8,
                            }),
                            menu: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                        />
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
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                        Your Expectations
                      </h2>
                      <div className="space-y-4 mb-10">
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
                      <div className="space-y-2 ">
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
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                        Create Password
                      </h2>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="password must be over 5 characters"
                            required
                            minLength={6}
                            maxLength={15}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            tabIndex={-1}
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm password"
                            required
                            minLength={6}
                            maxLength={15}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            tabIndex={-1}
                            onClick={() => setShowConfirmPassword((v) => !v)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-4">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        onClick={handlePrevious}
                        className="flex-1 bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        Previous
                      </Button>
                    )}
                    {currentStep < 4 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className={`flex-1 ${
                          isSubmitting
                            ? "bg-green-600"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white py-2 px-4 rounded-lg flex items-center justify-center`}
                        disabled={
                          isSubmitting ||
                          !(
                            formData.password.trim().length >= 6 &&
                            formData.password.trim().length <= 15 &&
                            formData.confirmPassword.trim().length >= 6 &&
                            formData.confirmPassword.trim().length <= 15 &&
                            formData.password === formData.confirmPassword
                          )
                        }
                      >
                        {isSubmitting && (
                          <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                        )}
                        {isSubmitting
                          ? "Registering..."
                          : "Complete Registration"}
                      </Button>
                    )}
                  </div>

                  {/* Error/Success Message */}
                  {errorMessage && (
                    <div className="mb-4 p-3 rounded bg-red-100 text-red-800 text-center font-semibold">
                      {errorMessage}
                    </div>
                  )}
                  {successMessage && (
                    <div className="mb-4 p-3 rounded bg-green-100 text-green-800 text-center font-semibold">
                      {successMessage}
                    </div>
                  )}
                </form>
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
