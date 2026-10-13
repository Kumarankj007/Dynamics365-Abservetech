import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/reviews/StarRating";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  title?: string;
  comment: string;
  date: string;
  isPublished: boolean;
  isAdminCreated: boolean;
  helpfulVotes: number;
}

interface ReviewManagerProps {
  courseId: string;
}

export const ReviewManager = ({ courseId }: ReviewManagerProps) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      reviewerName: "Sarah M.",
      rating: 5,
      title: "Excellent comprehensive course",
      comment: "This course exceeded my expectations. The instructor explains complex F&O concepts in a clear, easy-to-understand manner. The practical examples and real-world scenarios make it easy to apply what you learn. I've been working with Dynamics 365 for 2 years and still learned so much from this course. Highly recommended for anyone looking to master F&O implementation.",
      date: "2024-01-15",
      isPublished: true,
      isAdminCreated: false,
      helpfulVotes: 12
    },
    {
      id: "2", 
      reviewerName: "Michael K.",
      rating: 4,
      title: "Great content, could use more hands-on labs",
      comment: "The content is very thorough and well-structured. I particularly enjoyed the legal entity configuration modules. However, I would have liked to see more hands-on lab exercises to practice the concepts. The theoretical knowledge is solid, but more practical application would make this perfect. Still a great course overall and I learned a lot about the implementation lifecycle.",
      date: "2024-01-10",
      isPublished: false,
      isAdminCreated: false,
      helpfulVotes: 8
    },
    {
      id: "3",
      reviewerName: "Jennifer L.",
      rating: 5,
      title: "Perfect for beginners and intermediates",
      comment: "As someone new to Dynamics 365 F&O, this course was exactly what I needed. The step-by-step approach starting from basic concepts and building up to advanced configuration is brilliant. The instructor's experience really shows through the practical tips and best practices shared throughout the course. I feel confident implementing F&O solutions after completing this.",
      date: "2024-01-08",
      isPublished: true,
      isAdminCreated: true,
      helpfulVotes: 15
    }
  ]);

  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newReview, setNewReview] = useState({
    reviewerName: "",
    rating: 5,
    title: "",
    comment: "",
    isPublished: false
  });

  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => {
      switch (filterBy) {
        case "published":
          return review.isPublished;
        case "unpublished":
          return !review.isPublished;
        case "admin-created":
          return review.isAdminCreated;
        case "user-created":
          return !review.isAdminCreated;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating-high":
          return b.rating - a.rating;
        case "rating-low":
          return a.rating - b.rating;
        case "helpful":
          return b.helpfulVotes - a.helpfulVotes;
        default: // recent
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const handleCreateReview = async () => {
    if (!newReview.reviewerName || !newReview.comment || newReview.comment.length < 140) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields. Comment must be at least 140 characters.",
        variant: "destructive"
      });
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      reviewerName: newReview.reviewerName,
      rating: newReview.rating,
      title: newReview.title || undefined,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      isPublished: newReview.isPublished,
      isAdminCreated: true,
      helpfulVotes: 0
    };

    setReviews([review, ...reviews]);
    setNewReview({
      reviewerName: "",
      rating: 5,
      title: "",
      comment: "",
      isPublished: false
    });
    setShowCreateDialog(false);

    toast({
      title: "Review Created",
      description: `Review ${newReview.isPublished ? 'published' : 'saved as draft'} successfully.`
    });
  };

  const handleEditReview = async () => {
    if (!editingReview) return;

    setReviews(reviews.map(review => 
      review.id === editingReview.id ? editingReview : review
    ));
    setEditingReview(null);

    toast({
      title: "Review Updated",
      description: "Review has been updated successfully."
    });
  };

  const handleDeleteReview = async (reviewId: string) => {
    setReviews(reviews.filter(review => review.id !== reviewId));
    
    toast({
      title: "Review Deleted",
      description: "Review has been deleted successfully."
    });
  };

  const handleTogglePublish = async (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, isPublished: !r.isPublished } : r
    ));

    toast({
      title: review.isPublished ? "Review Unpublished" : "Review Published",
      description: `Review has been ${review.isPublished ? 'unpublished' : 'published'} successfully.`
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Course Reviews Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Moderate, edit, and manage all course reviews. Create admin reviews and control publication.
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Review</DialogTitle>
              <DialogDescription>
                Create an admin review for this course.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Reviewer Name *</Label>
                <Input
                  value={newReview.reviewerName}
                  onChange={(e) => setNewReview({ ...newReview, reviewerName: e.target.value })}
                  placeholder="e.g., John D."
                />
              </div>

              <div>
                <Label>Rating *</Label>
                <StarRating
                  value={newReview.rating}
                  onChange={(value) => setNewReview({ ...newReview, rating: value })}
                  size="lg"
                />
              </div>

              <div>
                <Label>Title (optional)</Label>
                <Input
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  placeholder="Review title"
                />
              </div>

              <div>
                <Label>Comment *</Label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Write the review content..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {newReview.comment.length}/1000 characters (min 140)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Label>Publish immediately</Label>
                <Switch
                  checked={newReview.isPublished}
                  onCheckedChange={(checked) => setNewReview({ ...newReview, isPublished: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReview}>
                {newReview.isPublished ? 'Create & Publish' : 'Save Draft'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter reviews" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="unpublished">Unpublished</SelectItem>
            <SelectItem value="admin-created">Admin Created</SelectItem>
            <SelectItem value="user-created">User Created</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="rating-high">Highest Rating</SelectItem>
            <SelectItem value="rating-low">Lowest Rating</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h4 className="text-lg font-medium text-foreground mb-2">
                No reviews found
              </h4>
              <p className="text-muted-foreground">
                {filterBy === "all" ? "Create the first review for this course." : "Try adjusting your filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="py-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-foreground">
                          {review.reviewerName}
                        </span>
                        {review.isAdminCreated && (
                          <Badge variant="secondary" className="text-xs">
                            Admin Created
                          </Badge>
                        )}
                        <Badge 
                          variant={review.isPublished ? "default" : "outline"}
                          className={review.isPublished ? "bg-green-100 text-green-800" : ""}
                        >
                          {review.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StarRating value={review.rating} readonly size="sm" />
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.date)}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {review.helpfulVotes} helpful votes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublish(review.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {review.isPublished ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingReview(review)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Review</DialogTitle>
                          <DialogDescription>
                            Make changes to this review.
                          </DialogDescription>
                        </DialogHeader>
                        
                        {editingReview && (
                          <div className="space-y-4">
                            <div>
                              <Label>Reviewer Name</Label>
                              <Input
                                value={editingReview.reviewerName}
                                onChange={(e) => setEditingReview({ 
                                  ...editingReview, 
                                  reviewerName: e.target.value 
                                })}
                              />
                            </div>

                            <div>
                              <Label>Rating</Label>
                              <StarRating
                                value={editingReview.rating}
                                onChange={(value) => setEditingReview({ 
                                  ...editingReview, 
                                  rating: value 
                                })}
                                size="lg"
                              />
                            </div>

                            <div>
                              <Label>Title</Label>
                              <Input
                                value={editingReview.title || ""}
                                onChange={(e) => setEditingReview({ 
                                  ...editingReview, 
                                  title: e.target.value 
                                })}
                              />
                            </div>

                            <div>
                              <Label>Comment</Label>
                              <Textarea
                                value={editingReview.comment}
                                onChange={(e) => setEditingReview({ 
                                  ...editingReview, 
                                  comment: e.target.value 
                                })}
                                rows={4}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label>Published</Label>
                              <Switch
                                checked={editingReview.isPublished}
                                onCheckedChange={(checked) => setEditingReview({ 
                                  ...editingReview, 
                                  isPublished: checked 
                                })}
                              />
                            </div>
                          </div>
                        )}

                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingReview(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleEditReview}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Review</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this review? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteReview(review.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="space-y-3">
                  {review.title && (
                    <h4 className="font-medium text-foreground">
                      {review.title}
                    </h4>
                  )}
                  <p className="text-foreground leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};