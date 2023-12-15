/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js";
import BillsUI from "../views/BillsUI.js";
import { ROUTES } from "../constants/routes.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then i check if i'm in the newBill page", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillForm = screen.getByTestId("form-new-bill");
      expect(newBillForm).toBeTruthy();
    })
    test("Then it should show 8 inputs", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const expenseTypeInput = screen.getByTestId("expense-type");
      expect(expenseTypeInput).toBeTruthy();

      const expenseNameInput = screen.getByTestId("expense-name");
      expect(expenseNameInput).toBeTruthy();

      const expenseDatepicker = screen.getByTestId("datepicker");
      expect(expenseDatepicker).toBeTruthy();

      const expenseAmount = screen.getByTestId("amount");
      expect(expenseAmount).toBeTruthy();

      const expenseVat = screen.getByTestId("vat");
      expect(expenseVat).toBeTruthy();

      const expensePct = screen.getByTestId("pct");
      expect(expensePct).toBeTruthy();

      const expenseCommentary = screen.getByTestId("commentary");
      expect(expenseCommentary).toBeTruthy();

      const expenseFile = screen.getByTestId("file");
      expect(expenseFile).toBeTruthy();
    })
    describe("when I add an image file as bill proof", () => {
      let mockAlert;

      beforeAll(() => {
        // Avant les tests, configurez un mock pour window.alert
        mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => { });
      });

      afterAll(() => {
        // Après les tests, assurez-vous de restaurer la fonctionnalité normale de window.alert
        mockAlert.mockRestore();
      });

      test("then this new file should have been changed in the input", () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTE({ pathname });
        };

        const html = NewBillUI();
        document.body.innerHTML = html;

        const newBills = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const handleChangeFile = jest.fn((e) => newBills.handleChangeFile(e));
        const fileInput = screen.getByTestId("file");

        fileInput.addEventListener("change", handleChangeFile);
        fireEvent.change(fileInput, {
          target: {
            files: [new File(["bill.png"], "bill.png", { type: "image/png" })],
          },
        });

        // Vérifiez si window.alert a été appelé avec les arguments attendus
        expect(mockAlert).toHaveBeenCalledWith('Le format du fichier doit être jpg, jpeg ou png');

        // Vérifiez si handleChangeFile a été appelé
        expect(handleChangeFile).toHaveBeenCalled();

        // Vérifiez si le nom du fichier dans le champ d'entrée de fichier correspond à "bill.png"
        expect(fileInput.files[0].name).toBe("bill.png");
      });
    });
    describe("When I add a non-image file as bill proof", () => {
      let mockAlert;

      beforeAll(() => {
        // Avant les tests, configurez un mock pour window.alert
        mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => { });
      });

      afterAll(() => {
        // Après les tests, assurez-vous de restaurer la fonctionnalité normale de window.alert
        mockAlert.mockRestore();
      });

      test("Then throw an alert", () => {
        Object.defineProperty(window, "localeStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const html = NewBillUI();
        document.body.innerHTML = html;

        const newBills = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const handleChangeFile = jest.fn((e) => newBills.handleChangeFile(e));
        const fileInput = screen.getByTestId("file");

        fileInput.addEventListener("change", handleChangeFile);
        fireEvent.change(fileInput, {
          target: {
            files: [new File(["video.mp4"], "video.mp4", { type: "video/mp4" })],
          },
        });

        // Vérifiez si handleChangeFile a été appelé
        expect(handleChangeFile).toHaveBeenCalled();

        // Vérifiez si window.alert a été appelé avec les arguments attendus
        expect(mockAlert).toHaveBeenCalledWith('Le format du fichier doit être jpg, jpeg ou png');
      });
    });
    describe("When I submit form", () => {
      test("Then a bill is created", () => {
        //page NewBill
        const html = NewBillUI();
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        // initialisation NewBill
        const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
        //fonctionnalité submit
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
        const submit = screen.getByTestId('form-new-bill');
        submit.addEventListener('submit', handleSubmit);
        fireEvent.submit(submit)
        expect(handleSubmit).toHaveBeenCalled();
      })
      test("Then, I should be sent on Bills page", () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const html = NewBillUI();
        document.body.innerHTML = html;

        const newBills = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const handleSubmit = jest.fn((e) => newBills.handleSubmit);
        const newBillForm = screen.getByTestId("form-new-bill");
        newBillForm.addEventListener("submit", handleSubmit);

        fireEvent.submit(newBillForm);

        expect(handleSubmit).toHaveBeenCalled();
        expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
      });
      describe("When I send a new Bill", () => {
        test("fetches bills from mock API POST", async () => {
          const getSpy = jest.spyOn(mockStore, "bills");

          const newBill = {
            id: "47qAXb6fIm2zOKkLzMro",
            vat: "80",
            fileUrl:
              "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
            status: "pending",
            type: "Hôtel et logement",
            commentary: "séminaire billed",
            name: "encore",
            fileName: "preview-facture-free-201801-pdf-1.jpg",
            date: "2004-04-04",
            amount: 400,
            commentAdmin: "ok",
            email: "a@a",
            pct: 20,
          };
          const bills = mockStore.bills(newBill);
          expect(getSpy).toHaveBeenCalledTimes(1);
          expect((await bills.list()).length).toBe(4);
        });
        test("Then it fails with a 404 message error", async () => {
          const html = BillsUI({ error: 'Erreur 404' })
          document.body.innerHTML = html;
          const message = screen.getByText(/Erreur 404/);
          expect(message).toBeTruthy();
        })
        test("Then it fails with a 500 message error", async () => {
          const html = BillsUI({ error: 'Erreur 500' })
          document.body.innerHTML = html;
          const message = screen.getByText(/Erreur 500/);
          expect(message).toBeTruthy();
        })
      })
    });
  });
})
