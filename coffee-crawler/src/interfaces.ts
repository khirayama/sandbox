/* Request */
export interface IRequest {
  url: string;
  requestedAt: string;
  isMobile: boolean;
}

/* Page */
export interface IAlternate {
  url: string;
  lang: string;
}

export interface ILocation {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  origin: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
}

export interface IHead {
  title: string;
  description: string;
  keywords: string;
  // FYI: og:image, twitter:image and so on
  images: string[];
  canonical: string;
  alternates: IAlternate[];
}

export interface IBody {
  html: string;
}

export interface IPage {
  head: IHead;
  body: IBody;
  location: ILocation;
}

/* Result */
export interface ILink {
  isExternal: boolean;
  text: string;
  url: string;
}

export interface IContent {
  text: string;
  headings: string[];
  links: ILink[];
}

export interface IPageView {
  page: IPage;
  request: IRequest;
  content: IContent;
}

export interface IRequestItem {
  priority: number;
  url: string;
  isMobile: boolean;
}
