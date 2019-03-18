import * as puppeteer from 'puppeteer';

import { IContent, ILink, IPage, IPageView, IRequest, IRequestItem } from './interfaces';

export class Crawler {
  private pageViews: IPageView[] = [];

  private internalRequestQueue: IRequestItem[] = [];

  private externalRequestQueue: IRequestItem[] = [];

  private browser: puppeteer.Browser | null = null;

  private page: puppeteer.Page | null = null;

  private createRequestItem(url: string, isMobile: boolean): IRequestItem {
    return {
      priority: 1,
      url,
      isMobile,
    };
  }

  private addRequestItemToInternalRequestQeueu(requestItem: IRequestItem): void {
    for (const pageView of this.pageViews) {
      if (pageView.request.url === requestItem.url /* && requestedAtが10日たってない */) {
        return;
      }
    }

    for (const ri of this.internalRequestQueue) {
      if (ri.url === requestItem.url) {
        ri.priority += 1;
        return;
      }
    }

    this.internalRequestQueue.push(requestItem);
    this.internalRequestQueue.sort((x, y) => x.priority - y.priority);
  }

  private addRequestItemToExternalRequestQeueu(requestItem: IRequestItem): void {
    for (const ri of this.externalRequestQueue) {
      if (ri.url === requestItem.url) {
        ri.priority += 1;
        return;
      }
    }

    this.externalRequestQueue.push(requestItem);
    this.externalRequestQueue.sort((x, y) => x.priority - y.priority);
  }

  private async crawl(): Promise<void> {
    if (this.internalRequestQueue.length) {
      console.log(`----------- request queue: ${this.internalRequestQueue.length} ----------------`);
      this.internalRequestQueue.forEach((ri: IRequestItem) => console.log(`request queue has a request ${ri.url} as ${ri.isMobile ? 'mobile' : 'desktop' }.`));

      const requestItem: IRequestItem = this.internalRequestQueue.shift();
      // TODO: Supports isMobile
      await this.page.goto(requestItem.url);
      await this.page.waitFor(2000);
      const pageView: IPageView = await this.getPageView(requestItem.url, requestItem.isMobile);
      this.pageViews.push(pageView);
      pageView.content.links.forEach((link: ILink) => {
        if (!link.isExternal) {
          const newRequesItem: IRequestItem = this.createRequestItem(link.url, requestItem.isMobile);
          this.addRequestItemToInternalRequestQeueu(newRequesItem);
        } else {
          const newRequesItem: IRequestItem = this.createRequestItem(link.url, requestItem.isMobile);
          this.addRequestItemToExternalRequestQeueu(newRequesItem);
        }
      });
      return await this.crawl();
    } else {
      console.log('request queue has no request.');
      console.log(`----------- external request queue: ${this.externalRequestQueue.length} ----------------`);
      this.externalRequestQueue.forEach((ri: IRequestItem) => console.log(`external request queue has a request ${ri.url} as ${ri.isMobile ? 'mobile' : 'desktop' }.`));
    }
  }

  private async getPageView(url: string, isMobile: boolean): Promise<IPageView> {
    const request: IRequest = {
      url,
      isMobile,
      requestedAt: new Date().toString(),
    };
    const page: IPage = await this.page.evaluate((): IPage => {
      return {
        head: {
          title: '',
          description: '',
          keywords: '',
          images: [''],
          canonical: '',
          alternates: [
            {
              url: '',
              lang: '',
            },
          ],
        },
        body: {
          html: window.document.body.innerHTML,
        },
        location: {
          hash: window.location.hash,
          host: window.location.host,
          hostname: window.location.hostname,
          href: window.location.href,
          origin: window.location.origin,
          pathname: window.location.pathname,
          port: window.location.port,
          protocol: window.location.protocol,
          search: window.location.search,
        },
      };
    });
    const content: IContent = await this.page.evaluate((): IContent => {
      const linkElements: NodeListOf<HTMLAnchorElement> = window.document.querySelectorAll('a');
      const links: ILink[] = [];
      linkElements.forEach((el: HTMLAnchorElement) => {
        const isExternal: boolean = el.href.indexOf(window.location.origin) !== 0;

        links.push({
          isExternal,
          text: el.innerText,
          url: el.href,
        });
      });

      return {
        text: window.document.body.innerText,
        headings: [],
        links,
      };
    });

    return {
      request,
      page,
      content,
    };
  }

  public async start(url: string, isMobile: boolean) {
    const requesItem: IRequestItem = this.createRequestItem(url, isMobile);
    this.addRequestItemToInternalRequestQeueu(requesItem);

    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();

    await this.crawl();
    await this.browser.close();
  }
}
