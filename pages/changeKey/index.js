import GetKey from "@/components/getKey";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Page() {
  const { data: _, status } = useSession();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      window.location.href = "/";
      return;
    } else {
      setLoaded(true);
    }
  }, [status]);

  return (
    <>
      {loaded ? <GetKey /> : ""}
    </>
  )
}