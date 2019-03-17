import * as puppeteer from 'puppeteer';

/* Request */
interface IRequest {
  url: string;
  isMobile: boolean;
}

/* Page */
interface IAlternate {
  url: string;
  lang: string;
}

interface ILocation {
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

interface IHead {
  title: string;
  description: string;
  keywords: string;
  // FYI: og:image, twitter:image and so on
  images: string[];
  canonical: string;
  alternates: IAlternate[];
}

interface IBody {
  html: string;
}

interface IPage {
  head: IHead;
  body: IBody;
  location: ILocation;
}

/* Result */
interface ILink {
  isExternal: boolean;
  text: string;
  url: string;
}

interface IResult {
  text: string;
  links: ILink[];
}

/*
 * ページとページの関係、もしくはサイトという関係性をどう示し構築するか
 */

console.log('Hi');
