import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/labs/nl-vision",
    permanent: false,
  },
});

export default function NLVisionRedirect() {
  return null;
}
