import { AppPage } from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display message saying Test on home page', () => {
    page.navigateTo('/login');
    // const navlink = page.getAllElements('a').get(1);
    // navlink.click();
    // expect(page.getParagraphText('app-root h1')).toEqual('Test');
  });
  
});
