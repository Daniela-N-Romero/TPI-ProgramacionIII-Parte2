import type { IUserStorage } from '../../../types/IUser';
import { rolRedirect, validatePassword } from '../../../utils/auth/auth';
import { getUsers, loginUser, saveUser } from '../../../utils/storage/userStorage'

const form = document.getElementById("registro-form") as HTMLFormElement;
const inputName = document.getElementById("name") as HTMLInputElement;
const inputApellido = document.getElementById("apellido") as HTMLInputElement;
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
    const valueName = inputName.value;
    const valueApellido = inputApellido.value;
    const users = getUsers();

    if (!valueName || !valueApellido) {
        alert("Por favor, complete su nombre y apellido.");
        return;
    }

    if (!validatePassword(valuePassword) || !validatePassword(valuePasswordConfirm)) {
        alert("La contraseña no cumple con los requisitos.");
        return;
    }

    if (valuePassword !== valuePasswordConfirm) {
        alert("Las contraseñas no coinciden.")
        return
    }

    const newUser: IUserStorage = {
        mail: valueEmail,
        //solo creamos usuarios clientes. El Admin se da por defecto
        rol: 'USUARIO',
        nombre: "",
        apellido: "",
        celular: "",
        password: valuePassword,
        id: getUsers().length+1
    };

    const existeUsuario = users.some((user) => user.mail === valueEmail);
    if (existeUsuario) {
        alert("Email no disponible.")
        return
    }

    saveUser(newUser)
    const { password, ...userToLog } = newUser;
    loginUser({...userToLog, loggedIn:true})
    alert("Usuario Registrado. Redirigiendo al home...")
    setTimeout(() => rolRedirect(newUser.rol, "/adminPanel", "/tienda"), 1500)

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

//cambiamos las clases que indican si se cumplen o no los requisitos de la contraseña para mostrar al usuario que debe corregir. Si se cumplen, se muestra en verde, sino se quedan gris.
function actualizarValidez(elemento: HTMLElement, esValido: boolean) {
    if (esValido) {
        elemento.classList.remove('invalido');
        elemento.classList.add('valido');
    } else {
        elemento.classList.remove('valido');
        elemento.classList.add('invalido');
    }
}