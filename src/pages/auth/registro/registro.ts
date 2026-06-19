import type { IUserStorage } from '../../../types/IUserStorage';
import { rolRedirect, validatePassword } from '../../../utils/auth';
import { getUsers, loginUser, saveUser } from '../../../utils/localStorage'

const form = document.getElementById("registro-form") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;
const inputPasswordConfirm = document.getElementById("passwordConfirm") as HTMLInputElement;
const passwords = document.querySelectorAll(".password") as NodeListOf<HTMLInputElement>;
const pLongitud = document.getElementById('longitud') as HTMLElement;
const pletra = document.getElementById('letra') as HTMLElement;
const pNum = document.getElementById('numero') as HTMLElement;
const pIgualdad = document.getElementById('igualdad') as HTMLElement;

form?.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();
    const valueEmail = inputEmail.value;
    const valuePassword = inputPassword.value;
    const valuePasswordConfirm = inputPasswordConfirm.value;
    const users = getUsers();

    if (valuePassword !== valuePasswordConfirm) {
        alert("Las contraseñas no coinciden.")
        return
    }

    if (!validatePassword(valuePassword) || !validatePassword(valuePasswordConfirm)) {
        alert("La contraseña no cumple con los requisitos.");
        return;
    }


    const newUser: IUserStorage = {
        mail: valueEmail,
        //solo creamos usuarios clientes. El Admin se da por defecto
        rol: 'USUARIO',
        loggedIn: true,
        password: valuePassword,
        id: crypto.randomUUID()
    };

    const existeUsuario = users.some((user) => user.mail === valueEmail);
    if (existeUsuario) {
        alert("Email no disponible.")
        return
    }

    saveUser(newUser)
    const { password, id, ...userToLog } = newUser;
    loginUser(userToLog)
    alert("Usuario Registrado. Redirigiendo al home...")
    setTimeout(() => rolRedirect(newUser.rol, "/src/pages/admin/adminHome/home.html", "/src/pages/store/home/storeHome.html"), 1500)

}
)
passwords.forEach(input => {
    input.addEventListener('input', () => {
        const valor = inputPassword.value;
        const valorConfirm = inputPasswordConfirm.value;

        // 1. Longitud
        actualizarValidez(pLongitud, valor.length >= 6 && valor.length <= 20 );

        // 2. Letra
        actualizarValidez(pletra, /[a-zA-Z]/.test(valor));

        // 3. Numero
        actualizarValidez(pNum, /\d/.test(valor));

        //4. Igualdad de contraseñas
        actualizarValidez(pIgualdad, valor === valorConfirm);
    })
});

function actualizarValidez(elemento: HTMLElement, esValido: boolean) {
    if (esValido) {
        elemento.classList.remove('invalido');
        elemento.classList.add('valido');
    } else {
        elemento.classList.remove('valido');
        elemento.classList.add('invalido');
    }
}