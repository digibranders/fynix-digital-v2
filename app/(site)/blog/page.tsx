import BlogIndex, { blogIndexMetadata } from "@/components/blog/BlogIndex";

export const revalidate = 300;

export const metadata = blogIndexMetadata(null);

export default function BlogIndexPage() {
  return <BlogIndex page={null} />;
}
