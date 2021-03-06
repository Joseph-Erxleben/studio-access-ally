import apiAction from "../api/api-actions";
import cookieActions from "../cookie/cookie-actions";
import Profile from "../components/Profile";
import Rental from "../components/Rental";

export default {
    SignUpPage,
    NavSignUp,
    NavLogin,
    LoginPage,
    Login
}

const appDiv = document.getElementById('app');
const staticAdminKey = "IsAdmin"
let NavBundle = "";

function SignUpPage() {
    return `
        <h3>Please create your account.</h3>

        <section class='signUpForm'>
            <input type='text' id='userName' placeholder='User Name'>
            <div id='helpName' class="text-danger"></div>
            <br/>
            <input type='password' id='password' placeholder='Password'>
            <div id='helpPass' class="text-danger"></div>
            <br/>
            <input type='password' id='adminKey' placeholder='Admin Key'/>
            <br/>
            <button id='saveUserButton'>Create Account</button>
            
        </section>
    `;
}

function NavSignUp() {
    const signUpLink = document.querySelector(".nav_signUp");
    ChangeSignUp();
    signUpLink.addEventListener('click', function(){
        NavBundle();
    });
}

function ChangeSignUp(){
    const signUpLink = document.querySelector(".nav_signUp");
    const userId = cookieActions.getCookie("userId");
    if (userId == "")
    {
        signUpLink.innerText = "Sign Up";
        NavBundle = SignUpBundle;
    }
    else{
        signUpLink.innerText = "Profile";
        NavBundle = ProfileBundle;
    }
}

function SignUpBundle(){
    appDiv.innerHTML = SignUpPage();
    CreateProfile();
}

function ProfileBundle(){
    const userId = cookieActions.getCookie("userId");
    appDiv.innerHTML = Profile.NavUserProfile(userId);
}

function CreateProfile() {
    const saveUserButton = document.getElementById('saveUserButton');
    saveUserButton.addEventListener('click', function(){
        const name = document.getElementById('userName').value;
        const password = document.getElementById('password').value;
        const adminKey = document.getElementById('adminKey').value;
        var isAdmin

        if (adminKey === staticAdminKey)
        {
            isAdmin = true;
        }
        else
        {
            isAdmin = false;
        }

        const requestBody = {
            Name: name,
            Password: password,
            isAdmin: isAdmin
        }
        
        if(name == "" && password == "")
        {
            document.getElementById('helpName').innerText = "*This Field Is Required.";
            document.getElementById('helpPass').innerText = "*This Field Is Required.";
        } 
        else if (name == "")
        {
            document.getElementById('helpName').innerText = "*This Field Is Required.";
            document.getElementById('helpPass').innerText = "";
        } 
        else if(password == "")
        {
            document.getElementById('helpName').innerText = "";
            document.getElementById('helpPass').innerText = "*This Field Is Required.";
        }
        else{
            var isUnique = true;

            apiAction.getRequest('https://localhost:44372/api/User', users =>{
                users.forEach(user => {
                    if (user.name === name){
                        isUnique = false;
                    }
                });

                if (isUnique == true){
                    apiAction.postRequest('https://localhost:44372/api/User', requestBody, data => {
                        cookieActions.setCookie("userName", data.name, 1);
                        cookieActions.setCookie("userId", data.id, 1);
                        cookieActions.setCookie("userIsAdmin", data.isAdmin, 1);
                        appDiv.innerHTML = Profile.ProfilePage(data);
                        NavLogin();
                        ChangeSignUp();
                        Rental.UpdateNavRental();
                        Profile.UpdateProfileButton();
                    })
                }
                else{
                    document.getElementById('helpName').innerText = "*This User Name Already Exists.";
                    document.getElementById('helpPass').innerText = "";
                }
            })
        }
    })
}

function NavLogin(){
    const logInLink = document.querySelector(".nav_login");
    const userId = cookieActions.getCookie("userId");
    if(userId == ""){
        logInLink.innerHTML = "Login";
        logInLink.addEventListener('click', function (){
            appDiv.innerHTML = LoginPage();
            Login();
        })
    }
    else{
        logInLink.innerHTML = "Logout";
        logInLink.addEventListener('click', function (){
            appDiv.innerHTML = LogoutPage();
            Logout();
            Login();
        })
    }
    
}

function LoginPage() {
    return `
        <h3>Please login.</h3>

        <section class='loginForm'>
            <input type='text' id='userName' placeholder='User Name' />
            <br/>
            <input type='password' id='password' placeholder='Password' />
            <br/>
            <button id='loginButton'>Login</button>
            <div id="warningText"></div>
        </section>
    `;
}

function Login(){
    const loginButton = document.getElementById('loginButton');
    loginButton.addEventListener('click', function(){
        const name = document.getElementById('userName').value;
        const password = document.getElementById('password').value;
        const requestBody = {
            Name: name,
            Password: password
        }
        
        apiAction.postRequest('https://localhost:44372/api/Account', requestBody, data =>
        {
            if(data.result == true){
                cookieActions.setCookie("userName", data.user.name, 1);
                cookieActions.setCookie("userId", data.user.id, 1);
                cookieActions.setCookie("userIsAdmin", data.user.isAdmin, 1);
                appDiv.innerHTML = Profile.ProfilePage(data.user);
                NavLogin();
                ChangeSignUp();
                Rental.UpdateNavRental();
                Profile.CancelRentalRequest();
                Rental.RentalDetailsButton();
                Profile.UpdateProfileButton(); 
            }
            else{
                const warningElement = document.getElementById('warningText');
                warningElement.innerHTML = data.message;
            }
        })
    })
}

function LogoutPage() {
    return `
        <h3>You have logged out</h3>

        <section class='loginForm'>
            <input type='text' id='userName' placeholder='User Name' />
            <br/>
            <input type='password' id='password' placeholder='Password' />
            <br/>
            <button id='loginButton'>Login</button>
            <div id="warningText"></div>
        </section>
    `;
}

function Logout() {
    cookieActions.deleteCookie("userName");
    cookieActions.deleteCookie("userId");
    cookieActions.deleteCookie("userIsAdmin");
    NavLogin();
    ChangeSignUp();
    Rental.UpdateNavRental();
}