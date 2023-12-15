/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      const iconActivated = windowIcon.classList.contains('active-icon')
      expect(iconActivated).toBeTruthy()
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    describe("when I click the button 'Nouvelle note de frais' ", () => {
      test("Then, it should create NewBill page ", () => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        const html = BillsUI({ data: [] })
        document.body.innerHTML = html;

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const bills = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localeStorage: window.localStorage,
        });

        const handleClickNewBill = jest.fn(bills.handleClickNewBill);
        const newBillBtn = screen.getByTestId('btn-new-bill');

        newBillBtn.addEventListener('click', handleClickNewBill);
        userEvent.click(newBillBtn);

        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.queryByText("Envoyer une note de frais")).toBeTruthy();
      });
    });

    describe("When i get bills", () => {
      test("Then it should render bills", async () => {
        const bills = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const getBills = jest.fn(() => bills.getBills());
        const value = await getBills();

        expect(getBills).toHaveBeenCalled();
        expect(value.length).toBe(4);
      });
    });

    describe("When i click on the eye icon from a bill", () => {
      test("A modal should open", () => {
        Object.defineProperty(window, "localStorage", { value: localStorageMock });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        const html = BillsUI({ data: [bills[1]] });
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const Store = null;
        const billsClass = new Bills({
          document,
          onNavigate,
          Store,
          localStorage: window.localStorage,
        });

        const modale = document.getElementById("modaleFile");

        $.fn.modal = jest.fn(() => modale.classList.add("show"));

        const handleClickIconEye = jest.fn(() => billsClass.handleClickIconEye);
        const iconEye = screen.getByTestId("icon-eye");

        iconEye.addEventListener("click", handleClickIconEye);

        userEvent.click(iconEye);
        expect(handleClickIconEye).toHaveBeenCalled();

        expect(modale.classList).toContain("show");
      });
    })
  })

  describe("When tha app try to fetch datas from the API", () => {
    describe("when it succed", () => {
      test("Then it should return an array with the corresponding length", async () => {
        const getSpy = jest.spyOn(mockStore, "bills");
        const bills = mockStore.bills();
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect((await bills.list()).length).toBe(4);
      });
    });
    describe("When it fails with a 404 error message", () => {
      test("Then if should display a 404 error message", async () => {
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
    });
    describe("When it fails with a 500 error message", () => {
      test("Then it should display a 500 error message", async () => {
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;

        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
})