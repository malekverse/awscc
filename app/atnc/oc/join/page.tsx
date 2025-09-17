"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Cloud, Loader2, Upload, FileText, Camera } from "lucide-react"
import { StarIcon } from "@/components/ui/star-icon"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Define form schema with validation rules
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(1, { message: "Phone number is required" })
    .refine(val => /^\+?[0-9\s()]*$/.test(val), {
      message: "Phone number can only contain numbers, spaces, and + or () characters"
    }),
  department: z.enum(["Sponsoring", "Media", "Logistics"], {
    required_error: "Please select a department",
  }),
  institute: z.string().min(1, { message: "Institute or city of residence is required" }),
  cv: z.any().optional().refine((file) => {
    if (!file) return true; // Allow empty/undefined
    return file instanceof File;
  }, {
    message: "Invalid CV file",
  }).refine((file) => {
    if (!file) return true; // Allow empty/undefined
    return file?.size <= 5000000;
  }, {
    message: "CV file size should be less than 5MB",
  }).refine((file) => {
    if (!file) return true; // Allow empty/undefined
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return allowedTypes.includes(file?.type);
  }, {
    message: "CV must be a PDF or Word document",
  }),
  photo: z.any().refine((file) => file instanceof File, {
    message: "Photo is required",
  }).refine((file) => file?.size <= 2000000, {
    message: "Photo size should be less than 2MB",
  }).refine((file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return allowedTypes.includes(file?.type);
  }, {
    message: "Photo must be a JPEG or PNG image",
  }),
});

// Define type based on the schema
type FormValues = z.infer<typeof formSchema>;

export default function OCTeamJoinPage() {
  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except + and ()
    let cleaned = value.replace(/[^\d+()]/g, "");
    
    // Handle international prefix
    if (cleaned.startsWith("+216")) {
      cleaned = "+216 " + cleaned.substring(4);
    } else if (cleaned.startsWith("(+216)")) {
      cleaned = "+216 " + cleaned.substring(7);
    }
    
    // Format the rest of the number with spaces
    if (cleaned.startsWith("+216 ")) {
      const rest = cleaned.substring(5).replace(/\s/g, "");
      if (rest.length > 0) {
        let formatted = rest.substring(0, 2);
        if (rest.length > 2) {
          formatted += " " + rest.substring(2, 5);
          if (rest.length > 5) {
            formatted += " " + rest.substring(5, 8);
          }
        }
        return "+216 " + formatted;
      }
      return "+216 ";
    } else {
      // Format without international prefix
      cleaned = cleaned.replace(/\s/g, "");
      if (cleaned.length > 0) {
        let formatted = cleaned.substring(0, 2);
        if (cleaned.length > 2) {
          formatted += " " + cleaned.substring(2, 5);
          if (cleaned.length > 5) {
            formatted += " " + cleaned.substring(5, 8);
          }
        }
        return formatted;
      }
    }
    return cleaned;
  };
  
  // Initialize form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      department: undefined,
      institute: "",
      cv: undefined,
      photo: undefined,
    },
  });
  
  // Handle phone number changes with formatting
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'phone' && value.phone) {
        const formatted = formatPhoneNumber(value.phone);
        if (formatted !== value.phone) {
          form.setValue('phone', formatted);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // State for form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add text fields
      formData.append('fullName', data.fullName);
      formData.append('email', data.email);
      formData.append('phone', data.phone ? data.phone.replace(/\s/g, "") : "");
      formData.append('department', data.department);
      formData.append('institute', data.institute);
      
      // Add file uploads
      if (data.cv) {
        formData.append('cv', data.cv);
      }
      if (data.photo) {
        formData.append('photo', data.photo);
      }
      
      // Submit to API
      const response = await fetch("/api/submit-oc-form", {
        method: "POST",
        body: formData, // Don't set Content-Type header for FormData
      });
      
      // Parse the response
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        // Use the error message from the API if available
        throw new Error(result.message || "Failed to submit form");
      }
      
      setIsSuccess(true);
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
      setError(error instanceof Error ? error.message : "There was an error submitting your form. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Header />
      <section className="py-12 md:py-16 lg:py-20 bg-secondary/20 dark:bg-transparent rounded-xl my-8 relative">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h1 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-transparent bg-clip-text">
            OC Team Event Registration
          </h1>
          <p className="max-w-[85%] leading-normal text-foreground sm:text-lg sm:leading-7">
            Complete the form below to register for the OC team event.
          </p>
        </div>

        <div className="absolute left-10 top-10">
          <Cloud className="h-8 w-8 text-primary/40 animate-pulse" />
        </div>
        <div className="absolute right-10 bottom-10">
          <StarIcon size={24} fill="#9B6DFF" className="animate-pulse-glow" />
        </div>

        <div className="mx-auto max-w-4xl mt-12">
          <Card className="border-[#E9E1FF] dark:border-gray-700 shadow-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-transparent bg-clip-text">
                OC Team Event Registration Form
              </CardTitle>
              <CardDescription>
                Please fill in all required fields to submit your registration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {isSuccess ? (
                <div className="p-6 text-center">
                  <div className="mb-4 text-green-500 dark:text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Registration Submitted!</h3>
                  <p className="mb-4">Thank you for registering for the OC team event. We've received your information and will be in touch soon.</p>
                  <p className="mb-4 text-sm text-muted-foreground">A confirmation email has been sent to your email address with important information about the event.</p>
                  <Button onClick={() => setIsSuccess(false)} className="mt-4">Submit Another Registration</Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {error && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
                        <div className="flex items-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <h3 className="font-semibold">Error Submitting Registration</h3>
                        </div>
                        {error}
                        <p className="mt-2 text-sm">Please try again or contact support if the problem persists.</p>
                      </div>
                    )}
                    
                    {/* Registration Information Section */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-transparent bg-clip-text">
                        Registration Information
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormDescription>Please provide your full legal name.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="your.email@example.com" {...field} />
                              </FormControl>
                              <FormDescription>We'll use this email to send you important event updates.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="+216 XX XXX XXX" 
                                  {...field} 
                                  value={field.value}
                                  onChange={(e) => {
                                    const formatted = formatPhoneNumber(e.target.value);
                                    field.onChange(formatted);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>In case we need to contact you about the event.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="institute"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Institute/City <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your institute or city of residence" {...field} />
                              </FormControl>
                              <FormDescription>If not applicable, enter your city of residence.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Department <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Sponsoring" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Sponsoring
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Media" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Media
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Logistics" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Logistics
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormDescription>
                              Select the department you're interested in joining.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Document Upload Section */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-transparent bg-clip-text">
                        Required Documents
                      </h3>
                      <div className="grid gap-6 md:grid-cols-2 items-start">
                        <FormField
                          control={form.control}
                          name="cv"
                          render={({ field: { onChange, value, ...field } }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>CV/Resume (Optional)</FormLabel>
                              <FormControl>
                                <div className="flex items-center justify-center w-full">
                                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <FileText className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold">Click to upload</span> your CV
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC or DOCX (MAX. 5MB)</p>
                                      {value && (
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                          Selected: {value.name}
                                        </p>
                                      )}
                                    </div>
                                    <Input
                                      {...field}
                                      type="file"
                                      accept=".pdf,.doc,.docx"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        onChange(file);
                                      }}
                                    />
                                  </label>
                                </div>
                              </FormControl>
                              <FormDescription>Upload your current CV or resume in PDF or Word format (optional).</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="photo"
                          render={({ field: { onChange, value, ...field } }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Professional Photo <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <div className="flex items-center justify-center w-full">
                                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <Camera className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold">Click to upload</span> your photo
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">JPEG or PNG (MAX. 2MB)</p>
                                      {value && (
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                          Selected: {value.name}
                                        </p>
                                      )}
                                    </div>
                                    <Input
                                      {...field}
                                      type="file"
                                      accept="image/jpeg,image/jpg,image/png"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        onChange(file);
                                      }}
                                    />
                                  </label>
                                </div>
                              </FormControl>
                              <FormDescription>
                                <div className="space-y-1">
                                  <p>Upload a professional headshot photo.</p>
                                  <p className="text-xs text-amber-600 dark:text-amber-400">
                                    <strong>Note:</strong> This photo will be used for your event badges and may be featured in the ATNC website team section.
                                  </p>
                                </div>
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Registration"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </main>
  );
}