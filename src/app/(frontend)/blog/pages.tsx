// "use client";
// import { useState } from "react";
// import { Input } from "@/core/components/ui/input";
// import { Badge } from "@/core/components/ui/badge";
// import { Card, CardContent, CardHeader } from "@/core/components/ui/card";
// import { Button } from "@/core/components/ui/button";
// import {
//   Search,
//   Calendar,
//   User,
//   Clock,
//   TrendingUp,
//   History,
//   Archive,
// } from "lucide-react";
// import ImageComponent from "@/core/components/imageComponent";

// const Blog = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("all");

//   // Mock data for blog posts
//   const blogPosts = [
//     {
//       id: 1,
//       title:
//         "Mastering Dynamics 365 Finance & Operations: A Complete Implementation Guide",
//       description:
//         "Learn the essential steps for successfully implementing D365 F&O in your organization, from planning to go-live.",
//       image: "/assets/logo.png",
//       author: "Sarah Johnson",
//       publishDate: "2024-01-15",
//       category: "Dynamics 365 F&O",
//       readTime: "8 min read",
//       featured: true,
//     },
//     {
//       id: 2,
//       title:
//         "Power Platform Integration Best Practices for Enterprise Solutions",
//       description:
//         "Discover how to seamlessly integrate Power Platform with your existing Microsoft ecosystem for maximum efficiency.",
//       image: "/assets/logo.png",
//       author: "Michael Chen",
//       publishDate: "2024-01-12",
//       category: "Power Platform",
//       readTime: "6 min read",
//       featured: false,
//     },
//     {
//       id: 3,
//       title: "Career Transition: From Traditional ERP to Modern Dynamics 365",
//       description:
//         "A comprehensive guide for professionals looking to advance their career in the Dynamics 365 ecosystem.",
//       image: "/assets/logo.png",
//       author: "Emily Rodriguez",
//       publishDate: "2024-01-10",
//       category: "Career Tips",
//       readTime: "10 min read",
//       featured: false,
//     },
//     {
//       id: 4,
//       title: "ERP Implementation Checklist: Avoiding Common Pitfalls",
//       description:
//         "Essential checkpoints and strategies to ensure your ERP implementation stays on track and delivers value.",
//       image: "/assets/logo.png",
//       author: "David Thompson",
//       publishDate: "2024-01-08",
//       category: "ERP Implementation",
//       readTime: "7 min read",
//       featured: false,
//     },
//     {
//       id: 5,
//       title:
//         "Power BI Analytics: Transforming Business Intelligence in Manufacturing",
//       description:
//         "Real-world examples of how Power BI revolutionizes data-driven decision making in manufacturing companies.",
//       image: "/assets/logo.png",
//       author: "Lisa Wang",
//       publishDate: "2024-01-05",
//       category: "Power Platform",
//       readTime: "5 min read",
//       featured: false,
//     },
//   ];

//   const categories = [
//     "all",
//     // "Dynamics 365 F&O",
//     "Power Platform",
//     "ERP Implementation",
//     "Career Tips",
//   ];

//   const recentPosts = blogPosts.slice(0, 3);
//   const trendingPosts = blogPosts.slice(1, 4);

//   const filteredPosts = blogPosts.filter((post) => {
//     const matchesSearch =
//       post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       post.description.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesCategory =
//       selectedCategory === "all" || post.category === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });

//   const featuredPost = blogPosts.find((post) => post.featured);
//   const regularPosts = filteredPosts.filter((post) => !post.featured);

//   return (
//     <div className="min-h-screen bg-background pt-28">
//       <div className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 glow-text">
//             Dynamics 365 Insights
//           </h1>
//           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//             Stay updated with the latest insights, best practices, and expert
//             guidance on Microsoft Dynamics 365 and digital transformation.
//           </p>
//         </div>

//         {/* Search and Filters */}
//         <div className="mb-12 space-y-6">
//           {/* Search Bar */}
//           <div className="relative max-w-2xl mx-auto">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//             <Input
//               placeholder="Search articles, topics, or authors..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 bg-card border-border focus:border-primary transition-all duration-300"
//             />
//           </div>

//           {/* Category Filters */}
//           <div className="flex flex-wrap justify-center gap-3">
//             {categories.map((category) => (
//               <Button
//                 key={category}
//                 variant={selectedCategory === category ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => setSelectedCategory(category)}
//                 className="transition-all duration-300 hover:scale-105"
//               >
//                 {category === "all" ? "All Articles" : category}
//               </Button>
//             ))}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-3 space-y-8">
//             {/* Featured Blog Post */}
//             {featuredPost && selectedCategory === "all" && !searchQuery && (
//               <Card className="overflow-hidden bg-card border-border hover:shadow-glow transition-all duration-500 group">
//                 <div className="relative overflow-hidden">
//                   <ImageComponent
//                     height={500}
//                     width={500}
//                     src={featuredPost.image}
//                     alt={featuredPost.title}
//                     className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
//                   />
//                   <div className="absolute top-4 left-4">
//                     <Badge className="bg-primary text-primary-foreground">
//                       Featured
//                     </Badge>
//                   </div>
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                 </div>
//                 <CardHeader className="space-y-4">
//                   <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
//                     <Badge variant="outline">{featuredPost.category}</Badge>
//                     <div className="flex items-center gap-1">
//                       <User className="h-4 w-4" />
//                       {featuredPost.author}
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Calendar className="h-4 w-4" />
//                       {new Date(featuredPost.publishDate).toLocaleDateString()}
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Clock className="h-4 w-4" />
//                       {featuredPost.readTime}
//                     </div>
//                   </div>
//                   <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
//                     {featuredPost.title}
//                   </h2>
//                   <p className="text-muted-foreground leading-relaxed">
//                     {featuredPost.description}
//                   </p>
//                   <Button className="w-fit">Read Full Article</Button>
//                 </CardHeader>
//               </Card>
//             )}

//             {/* Blog Posts Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {regularPosts.map((post) => (
//                 <Card
//                   key={post.id}
//                   className="overflow-hidden bg-card border-border hover:shadow-glow transition-all duration-500 group cursor-pointer hover:-translate-y-2"
//                 >
//                   <div className="relative overflow-hidden">
//                     <ImageComponent
//                       width={500}
//                       height={500}
//                       src={post.image}
//                       alt={post.title}
//                       className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                   </div>
//                   <CardContent className="p-6 space-y-4">
//                     <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
//                       <Badge variant="outline" className="text-xs">
//                         {post.category}
//                       </Badge>
//                       <div className="flex items-center gap-1">
//                         <Clock className="h-3 w-3" />
//                         {post.readTime}
//                       </div>
//                     </div>
//                     <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
//                       {post.title}
//                     </h3>
//                     <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
//                       {post.description}
//                     </p>
//                     <div className="flex items-center justify-between pt-4 border-t border-border/50">
//                       <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                         <User className="h-3 w-3" />
//                         {post.author}
//                       </div>
//                       <div className="flex items-center gap-1 text-xs text-muted-foreground">
//                         <Calendar className="h-3 w-3" />
//                         {new Date(post.publishDate).toLocaleDateString()}
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>

//             {/* No results message */}
//             {filteredPosts.length === 0 && (
//               <div className="text-center py-12">
//                 <p className="text-muted-foreground text-lg">
//                   No articles found matching your search criteria.
//                 </p>
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setSearchQuery("");
//                     setSelectedCategory("all");
//                   }}
//                   className="mt-4"
//                 >
//                   Clear Filters
//                 </Button>
//               </div>
//             )}
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Recent Posts */}
//             <Card className="bg-card border-border">
//               <CardHeader>
//                 <div className="flex items-center gap-2">
//                   <History className="h-5 w-5 text-primary" />
//                   <h3 className="font-semibold text-foreground">
//                     Recent Posts
//                   </h3>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {recentPosts.map((post) => (
//                   <div
//                     key={post.id}
//                     className="space-y-2 pb-4 last:pb-0 border-b border-border/30 last:border-b-0"
//                   >
//                     <h4 className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-2">
//                       {post.title}
//                     </h4>
//                     <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                       <Calendar className="h-3 w-3" />
//                       {new Date(post.publishDate).toLocaleDateString()}
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>

//             {/* Trending Articles */}
//             <Card className="bg-card border-border">
//               <CardHeader>
//                 <div className="flex items-center gap-2">
//                   <TrendingUp className="h-5 w-5 text-primary" />
//                   <h3 className="font-semibold text-foreground">Trending</h3>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {trendingPosts.map((post, index) => (
//                   <div
//                     key={post.id}
//                     className="flex gap-3 pb-4 last:pb-0 border-b border-border/30 last:border-b-0"
//                   >
//                     <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
//                       <span className="text-sm font-bold text-primary">
//                         {index + 1}
//                       </span>
//                     </div>
//                     <div className="space-y-1">
//                       <h4 className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-2">
//                         {post.title}
//                       </h4>
//                       <p className="text-xs text-muted-foreground">
//                         {post.readTime}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>

//             {/* Archive */}
//             <Card className="bg-card border-border">
//               <CardHeader>
//                 <div className="flex items-center gap-2">
//                   <Archive className="h-5 w-5 text-primary" />
//                   <h3 className="font-semibold text-foreground">Archive</h3>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {[
//                   { month: "January 2024", count: 12 },
//                   { month: "December 2023", count: 8 },
//                   { month: "November 2023", count: 15 },
//                   { month: "October 2023", count: 10 },
//                 ].map((archive) => (
//                   <div
//                     key={archive.month}
//                     className="flex items-center justify-between text-sm"
//                   >
//                     <span className="text-foreground hover:text-primary cursor-pointer transition-colors">
//                       {archive.month}
//                     </span>
//                     <Badge variant="outline" className="text-xs">
//                       {archive.count}
//                     </Badge>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Blog;
