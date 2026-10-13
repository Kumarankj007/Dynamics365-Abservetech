'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useApiMutation from '@/hooks/Mutations/useApiMutation';
import { APICONSTANT } from '@/services/config';
import { useQueryClient } from '@tanstack/react-query';

interface Commissions {
  id: string;
  instructorShareDefault: string;
  platformShareDefault: string;
  effectiveFrom: string;
  createdAt: string;
  updatedAt?: string;
}

function GlobalDefaultForm({ commission, refetch }: {
  commission?: Commissions;
  refetch: () => void;
}) {

  // const [platformShare, setPlatformShare] = useState(
  //   Number(commission?.platformShareDefault) || 0
  // );
  const [platformShare, setPlatformShare] = useState(0);
  const instructorShare = 100 - platformShare;
  // const [effectiveFrom, setEffectiveFrom] = useState(
  //   commission?.effectiveFrom?.split("T")[0] || ""
  // );
  const [effectiveFrom, setEffectiveFrom] = useState("");

  useEffect(() => {
    if (commission) {
      setPlatformShare(Number(commission.platformShareDefault) || 0);
      setEffectiveFrom(commission.effectiveFrom?.split("T")[0] || "");
    }
  }, [commission]);

  const [coursePrice, setCoursePrice] = useState(1000); // default like screenshot

  const instructorEarnings = ((coursePrice * instructorShare) / 100).toFixed(2);
  const platformEarnings = ((coursePrice * platformShare) / 100).toFixed(2);

  const [isPending, startTransition] = React.useTransition();
  const queryClient = useQueryClient();
  const mutation = useApiMutation("put", "");

  const handleSave = async () => {
    startTransition(async () => {
      try {
        const payload = {
          platformShareDefault: platformShare,
          instructorShareDefault: instructorShare,
          effectiveFrom,
        };

        const response = await mutation.mutateAsync({
          url: { apiUrl: APICONSTANT.UPDATE_COMMISSION },
          body: payload,
        });

        if (!response?.error) {
          await queryClient.invalidateQueries({ queryKey: ["GET_COMMISSION"] });
        }

        refetch();
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Global Default</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">
            Platform Share (%)
          </label>
          <Input
            type="number"
            value={platformShare}
            min={0}
            max={100}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 0 && val <= 100) setPlatformShare(val);
            }}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">
            Instructor Share (%)
          </label>
          <Input type="number" value={instructorShare} disabled />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">
            Effective From
          </label>
          <Input
            type="date"
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-8 border-t pt-6">
        <h3 className="text-md font-medium mb-4">Mini Split Calculator</h3>
        <div className="max-w-xs">
          <label className="text-sm font-medium block mb-1">
            Course Price ($)
          </label>
          <Input
            type="number"
            value={coursePrice}
            onChange={(e) => setCoursePrice(Number(e.target.value))}
          />
        </div>
        <div className="mt-4 text-sm space-y-1">
          <p>
            Instructor earns <strong>{instructorShare}%</strong> =
            <strong> ${instructorEarnings}</strong>
          </p>

          <p>
            Platform earns <strong>{platformShare}%</strong> =
            <strong> ${platformEarnings}</strong>
          </p>

          <p className="text-xs">
            (before payment processing fees)
          </p>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Default"}
        </Button>
      </div>
    </div>
  )
}

export default GlobalDefaultForm;