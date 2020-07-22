import { AppPage } from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display title saying "Log in" on login page', () => {
    page.navigateTo('/login');
    expect(page.getParagraphText('app-root mat-card-title')).toEqual('Log in');
    // const navlink = page.getAllElements('button').get(1);
    // console.log("Button: ", navlink);
    // navlink.click();
    // expect(page.getParagraphText('app-root h1')).toEqual('Test');
  });
  
});
