import React, { Dispatch, SetStateAction } from "react";
import { Button } from "./ui/button";

export default function PaginationFooter({
  totalPages,
  page,
  setPage,
}: {
  totalPages: number;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
}) {
  return (
    totalPages > 1 && (
      <section className="flex justify-center items-center my-6 space-x-2">
        {/* Prev Button */}
        <Button
          size="sm"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>

        <p className="text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        {/* Page Numbers */}
        {/* {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={p === page ? "default" : "outline"}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))} */}
        {/* Next Button */}
        <Button
          size="sm"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </section>
    )
  );
}
