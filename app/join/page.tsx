"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Cloud, Loader2 } from "lucide-react"
import { StarIcon } from "@/components/ui/star-icon"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Define form schema with validation rules
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional()
    .refine(val => !val || /^\+?[0-9\s()]*$/.test(val), {
      message: "Phone number can only contain numbers, spaces, and + or () characters"
    }),
  role: z.string().min(1, { message: "Current role is required" }),
  organization: z.string().optional(),
  facebook: z.string().optional(),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  interests: z.array(z.string()).min(1, { message: "Please select at least one area of interest" }),
  otherInterest: z.string().optional(),
  meetingPreference: z.enum(["weekday", "weekend", "flexible"]),
  heardFrom: z.enum(["wordOfMouth", "socialMedia", "emailNewsletter", "website", "other"]),
  otherSourceText: z.string().optional(),
  agreement: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the membership terms" }),
  }),
});

// Define type based on the schema
type FormValues = z.infer<typeof formSchema>;

export default function JoinPage() {
  // Initialize form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      role: "",
      organization: "",
      facebook: "",
      experience: "beginner",
      interests: [],
      otherInterest: "",
      meetingPreference: "flexible",
      heardFrom: "wordOfMouth",
      otherSourceText: "",
      agreement: false,
    },
  });

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

  // State for form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      // Clean phone number for storage (remove spaces)
      const cleanedData = {
        ...data,
        phone: data.phone ? data.phone.replace(/\s/g, "") : "",
      };
      
      // Submit to Google Sheets
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
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
            Join the Club
          </h1>
          <p className="max-w-[85%] leading-normal text-foreground sm:text-lg sm:leading-7">
            Complete the form below to become a member of the AWS Cloud Club and participate in our activities.
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
                AWS Cloud Club Membership Form
              </CardTitle>
              <CardDescription>
                Please fill in all required fields to submit your membership application.
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
                  <h3 className="text-2xl font-bold mb-2">Application Submitted!</h3>
                  <p className="mb-4">Thank you for your interest in joining the AWS Cloud Club. We've received your application and will be in touch soon.</p>
                  <p className="mb-4 text-sm text-muted-foreground">A confirmation email has been sent to your email address with important information about your membership.</p>
                  <Button onClick={() => setIsSuccess(false)} className="mt-4">Submit Another Application</Button>
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
                          <h3 className="font-semibold">Error Submitting Application</h3>
                        </div>
                        {error}
                        <p className="mt-2 text-sm">Please try again or contact support if the problem persists.</p>
                      </div>
                    )}
                    
                    {/* Personal Information Section */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-transparent bg-clip-text">
                        Personal Information
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
                              <FormDescription>We'll use this email to send you important club updates.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Phone Number (Optional)</FormLabel>
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
                              <FormDescription>In case we need to contact you urgently.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Academic/Professional Information Section */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-transparent bg-clip-text">
                        Academic/Professional Information
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Current Role/Title <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="E.g., Student, Developer, Cloud Architect" {...field} />
                              </FormControl>
                              <FormDescription>What is your current role or title?</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="organization"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Organization/Institution (if applicable)</FormLabel>
                              <FormControl>
                                <Input placeholder="Where do you currently study or work?" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="facebook"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Facebook Profile (Optional)</FormLabel>
                              <FormControl>
                                <Input type="url" placeholder="https://facebook.com/your-profile" {...field} />
                              </FormControl>
                              <FormDescription>Optional: Share your Facebook for networking.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Cloud Experience Level</FormLabel>
                              <div className="pt-2">
                                <FormControl>
                                  <RadioGroup 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                    className="space-y-1"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="beginner" id="beginner" />
                                      <Label htmlFor="beginner">Beginner</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="intermediate" id="intermediate" />
                                      <Label htmlFor="intermediate">Intermediate</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="advanced" id="advanced" />
                                      <Label htmlFor="advanced">Advanced</Label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                {/* AWS Cloud Club Engagement Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-transparent bg-clip-text">
                    AWS Cloud Club Engagement
                  </h3>
                  <div className="grid gap-6 md:grid-cols-1">
                    <FormField
                      control={form.control}
                      name="interests"
                      render={() => (
                        <FormItem className="space-y-4">
                          <div>
                            <FormLabel>Areas of Interest <span className="text-red-500">*</span></FormLabel>
                            <FormDescription>
                              Select all areas of cloud computing that interest you.
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              { id: "compute", label: "Compute Services (EC2, Lambda)" },
                              { id: "storage", label: "Storage Solutions (S3, EBS)" },
                              { id: "database", label: "Database Services (RDS, DynamoDB)" },
                              { id: "networking", label: "Networking & Content Delivery" },
                              { id: "security", label: "Security & Identity" },
                              { id: "ml", label: "Machine Learning & AI" },
                              { id: "devops", label: "DevOps & CI/CD" },
                              { id: "serverless", label: "Serverless Architecture" },
                              { id: "containers", label: "Containers & Kubernetes" },
                              { id: "iot", label: "IoT Solutions" },
                            ].map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="interests"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, item.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {item.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                            <FormField
                              control={form.control}
                              name="interests"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes("other")}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, "other"])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== "other"
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      Other
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("interests")?.includes("other") && (
                      <FormField
                        control={form.control}
                        name="otherInterest"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Other Areas of Interest</FormLabel>
                            <FormControl>
                              <Input placeholder="Please specify other areas of interest" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="meetingPreference"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Meeting Preference</FormLabel>
                          <div className="pt-2">
                            <FormControl>
                              <RadioGroup 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                className="space-y-1"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="weekday" id="weekday" />
                                  <Label htmlFor="weekday">Weekday Evenings</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="weekend" id="weekend" />
                                  <Label htmlFor="weekend">Weekend</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="flexible" id="flexible" />
                                  <Label htmlFor="flexible">Flexible</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-transparent bg-clip-text">
                    Additional Information
                  </h3>
                  <div className="grid gap-4 md:grid-cols-1">
                    <FormField
                      control={form.control}
                      name="heardFrom"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>How did you hear about us?</FormLabel>
                          <div className="pt-2">
                            <FormControl>
                              <RadioGroup 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                className="space-y-1"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="wordOfMouth" id="wordOfMouth" />
                                  <Label htmlFor="wordOfMouth">Word of Mouth</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="socialMedia" id="socialMedia" />
                                  <Label htmlFor="socialMedia">Social Media</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="emailNewsletter" id="emailNewsletter" />
                                  <Label htmlFor="emailNewsletter">Email Newsletter</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="website" id="website" />
                                  <Label htmlFor="website">Website</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="other" id="otherSource" />
                                  <Label htmlFor="otherSource">Other</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("heardFrom") === "other" && (
                      <FormField
                        control={form.control}
                        name="otherSourceText"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Please specify how you heard about us</FormLabel>
                            <FormControl>
                              <Input placeholder="How did you hear about the AWS Cloud Club?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="agreement"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                              I agree to the membership terms and code of conduct. I understand that my personal information will be used only for club-related communications. <span className="text-red-500">*</span>
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
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