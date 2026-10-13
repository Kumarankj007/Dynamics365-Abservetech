"use client";

import { useRouter } from 'next/navigation';
import {  useEffect, useTransition } from "react";
import useTransitionStore from "../store/transition";
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";

function UseLoadingRouter() {
     const  router  = useRouter();
    const [isPending, startTransition] = useTransition();
    const { setPending } = useTransitionStore();
    // console.log('isPending', isPending)
    
    useEffect(() => {
      //global loading indicator=> make true
      const isLoading = isPending ? true : false;
      // console.log('isLoading', isLoading , isPending);
      setPending(isLoading)
      return ()=>{
        setPending(false)
      }
       // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPending]);
  
  const push = (href: string, options?: NavigateOptions) => {
    startTransition(() => {
      router.push(href, options);
    });
  };

  const replace = (href: string, options?: NavigateOptions) => {
    startTransition(() => {
      router.replace(href, options);
    });
  }
  const back = () => {
    startTransition(() => {
      router.back();
    });
  }



//   const [loading, setLoading] = useOptimistic(false);
// //   if (router.push.name === "patched") return;
//     const push = router.push;
//     router.push = function patched(...args) {
//       setLoading(true);
//       push.apply(history, args);
//     };
  
  return { push, replace, back};
}
export default UseLoadingRouter;