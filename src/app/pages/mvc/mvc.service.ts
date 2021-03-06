// Angular
import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// servicios de terceros
import { Observable } from 'rxjs';

// mis servicios
import { FormToolsService } from 'src/app/services/form-tools/form-tools.service';
import { FirestoreToolsService } from 'src/app/services/firestore-tools/firestore-tools.service';
import { AuthService } from '../../services/auth/auth.service';

// mis modelos
import { UserProviderModel } from 'src/app/models/user-provider/user-provider.model';

// constantes
import { environment } from 'src/environments/environment';
import { LoginEmailDataSendInterface } from '../../interfaces/login-email-data-send';

@Injectable()
export class MvcService {

  // ### MODELOS DE DATOS ###
  formLogin: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private formToolsService: FormToolsService,
    private authService: AuthService,
    private firestoreToolsService: FirestoreToolsService
  ) { }

  // ### LÓGICA DE NEGOCIO ###

  // llamadas AJAX a servicios externos de autenticación
  onTryEmailLogin(): Observable<firebase.auth.UserCredential> {
    const values: LoginEmailDataSendInterface = this.formLogin.value;
    return this.authService.doLogin(values);
  }

  onTryGoogleLogin(): Promise<firebase.auth.UserCredential> {
    return this.authService.googleLogin();
  }

  onTryFacebookLogin(): Promise<firebase.auth.UserCredential> {
    return this.authService.facebookLogin();
  }

  onTryTwitterLogin(): Promise<firebase.auth.UserCredential> {
    return this.authService.twitterLogin();
  }

  // MODELOS DE DATOS A GUARDAR EN LA DDBB
  createUserDataFromCredential(credential: firebase.auth.UserCredential): Promise<any> {
    const userLogin = new UserProviderModel(credential);
    return this.firestoreToolsService.updateFirestoneItemById (
      environment.firestoneCollectionNames.users,
      userLogin.uid,
      userLogin.saveUserInfoUpdate()
    );
  }

  updateUserProviderDataRRSS(credential: firebase.auth.UserCredential): Promise<any> {
    const uid = credential.user.uid;
    // tslint:disable-next-line: max-line-length
    const url = environment.firestoneCollectionNames.users + '/' + uid + '/' + environment.firestoneCollectionNames.morInfo + '/' + environment.firestoneCollectionNames.provider;
    return this.firestoreToolsService.updateFirestoneItem (
      url,
      credential.additionalUserInfo.profile
    );
  }

  doLogOut() {
    this.authService.doLogout();
  }

  deleteCurrentUser() {
    this.authService.deleteCurrentUser();
  }

  fetchProvidersForEmail(email: string) {
    return this.authService.fetchProvidersForEmail(email);
  }

  resetPassword(email: string) {
    return this.authService.resetPassword(email);
  }

  // creación de modelos de datos
  createForm() {
    this.formLogin = this.formBuilder.group({
      email: ['', [
                    Validators.required,
                    this.formToolsService.patternValidator(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, true, { email: true }),
                  ]],
      password: ['', [
                      Validators.required,
                      Validators.minLength(8),
                      this.formToolsService.patternValidator(/\d/, true, { hasNumber: true }),
                      this.formToolsService.patternValidator(/[A-Z]/, true, { hasCapitalCase: true }),
                      this.formToolsService.patternValidator(/[a-z]/, true, { hasSmallCase: true }),
                      this.formToolsService.patternValidator(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, true, { hasSpecialCharacters: true })
                    ]]
    });
  }
}
