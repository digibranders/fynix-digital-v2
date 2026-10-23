/** Copy for the blog templates. Post content itself comes from the CMS. */
export const blogContent = {
  index: {
    title: "Blog",
    description:
      "Articles from the Fynix team on SEO, web development, design and lead generation for B2B technology companies.",
    metaTitle: "Blog",
  },
  archive: {
    category: "Category",
    author: "Author",
  },
  empty: "No articles published yet.",
  pagination: {
    label: "Pagination",
    previous: "Previous",
    next: "Next",
  },
  post: {
    published: "Published",
    updated: "Updated",
    contents: "Contents",
    faq: "Frequently asked questions",
    related: "Keep reading",
  },
} as const;

export function pageLabel(page: number, totalPages: number): string {
  return `Page ${page} of ${totalPages}`;
}

export function archiveDescription(count: number, noun: string): string {
  return `${count} ${count === 1 ? "article" : "articles"} ${noun}.`;
}
