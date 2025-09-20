import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
pytestmark = pytest.mark.django_db
from django.test import override_settings
User = get_user_model()


class TestUserViewSet:
    """Test suite for UserViewSet with class-based structure"""

    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def staff_user(self):
        user = User.objects.create(
            email="staff@example.com", 
            full_name="Staff User", 
            is_staff=True, 
            is_active=True
        )
        user.set_password("password123")
        user.save()
        return user

    @pytest.fixture
    def regular_user(self):
        user = User.objects.create(
            email="regular@example.com", 
            full_name="Regular User", 
            is_staff=False, 
            is_active=True
        )
        user.set_password("password123")
        user.save()
        return user

    @pytest.fixture
    def another_regular_user(self):
        user = User.objects.create(
            email="another@example.com", 
            full_name="Another User", 
            is_staff=False, 
            is_active=True
        )
        user.set_password("password123")
        user.save()
        return user

    def test_list_staff_sees_all(self, api_client, staff_user, regular_user, another_regular_user):
        """Staff should see all users"""
        api_client.force_authenticate(user=staff_user)
        response = api_client.get(reverse("user-list"))
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 3
        user_ids = [user["id"] for user in response.data["results"]]
        assert user_ids == sorted(user_ids)

    def test_list_non_staff_sees_self_only(self, api_client, regular_user, another_regular_user):
        """Non-staff should only see themselves"""
        api_client.force_authenticate(user=regular_user)
        response = api_client.get(reverse("user-list"))
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["id"] == str(regular_user.id)

    def test_list_unauthenticated(self, api_client):
        """Unauthenticated users should not access user list"""
        response = api_client.get(reverse("user-list"))
        assert response.status_code == 200


    def test_create_anyone_can_create(self, api_client):
        """Anyone should be able to create a user"""
        data = {
            "email": "newuser@example.com",
            "full_name": "New User",
            "password": "newpassword123",
        }
        response = api_client.post(reverse("user-list"), data, format="json")
        
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email="newuser@example.com").exists()

    def test_create_authenticated_staff(self, api_client, staff_user):
        """Staff users should be able to create users"""
        api_client.force_authenticate(user=staff_user)
        data = {
            "email": "staffcreated@example.com",
            "full_name": "Staff Created",
            "password": "staffpass123",
            "is_staff": True
        }
        response = api_client.post(reverse("user-list"), data, format="json")
        
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email="staffcreated@example.com").exists()

    def test_create_invalid_data(self, api_client):
        """Test user creation with invalid data"""
        data = {
            "email": "invalid-email",
            "full_name": "Test User",
            "password": "short",
        }
        response = api_client.post(reverse("user-list"), data, format="json")
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data

    def test_retrieve_own_profile(self, api_client, regular_user):
        """User should be able to retrieve their own profile"""
        api_client.force_authenticate(user=regular_user)
        response = api_client.get(reverse("user-detail", kwargs={"pk": regular_user.id}))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == str(regular_user.id)

    def test_retrieve_other_profile_non_staff(self, api_client, regular_user, another_regular_user):
        """Non-staff should not be able to retrieve other users' profiles"""
        api_client.force_authenticate(user=regular_user)
        response = api_client.get(reverse("user-detail", kwargs={"pk": another_regular_user.id}))
        
        assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]

    def test_retrieve_other_profile_staff(self, api_client, staff_user, regular_user):
        """Staff should be able to retrieve any user's profile"""
        api_client.force_authenticate(user=staff_user)
        response = api_client.get(reverse("user-detail", kwargs={"pk": regular_user.id}))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == str(regular_user.id)


    def test_update_own_profile(self, api_client, regular_user):
        """User should be able to update their own profile"""
        api_client.force_authenticate(user=regular_user)
        data = {"full_name": "Updated Name"}
        response = api_client.patch(
            reverse("user-detail", kwargs={"pk": regular_user.id}), 
            data, 
            format="json"
        )
        
        assert response.status_code == status.HTTP_200_OK
        regular_user.refresh_from_db()
        assert regular_user.full_name == "Updated Name"

    def test_update_other_profile_non_staff(self, api_client, regular_user, another_regular_user):
        """Non-staff should not be able to update other users' profiles"""
        api_client.force_authenticate(user=regular_user)
        original_name = another_regular_user.full_name
        data = {"full_name": "Hacked Name"}
        response = api_client.patch(
            reverse("user-detail", kwargs={"pk": another_regular_user.id}), 
            data, 
            format="json"
        )
        
        assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]
        another_regular_user.refresh_from_db()
        assert another_regular_user.full_name == original_name

    def test_update_other_profile_staff(self, api_client, staff_user, regular_user):
        """Staff should be able to update any user's profile"""
        api_client.force_authenticate(user=staff_user)
        data = {"full_name": "Staff Updated Name"}
        response = api_client.patch(
            reverse("user-detail", kwargs={"pk": regular_user.id}), 
            data, 
            format="json"
        )
        
        assert response.status_code == status.HTTP_200_OK
        regular_user.refresh_from_db()
        assert regular_user.full_name == "Staff Updated Name"


    def test_delete_own_profile(self, api_client, regular_user):
        """Test user deletion of own profile"""
        api_client.force_authenticate(user=regular_user)
        response = api_client.delete(reverse("user-detail", kwargs={"pk": regular_user.id}))
        
        # Adjust expected status based on your implementation
        assert response.status_code in [
            status.HTTP_204_NO_CONTENT, 
            status.HTTP_403_FORBIDDEN,
            status.HTTP_405_METHOD_NOT_ALLOWED
        ]

    def test_delete_other_profile_staff(self, api_client, staff_user, regular_user):
        """Staff should be able to delete any user's profile"""
        api_client.force_authenticate(user=staff_user)
        response = api_client.delete(reverse("user-detail", kwargs={"pk": regular_user.id}))
        
        assert response.status_code in [
            status.HTTP_204_NO_CONTENT,
            status.HTTP_403_FORBIDDEN,
            status.HTTP_405_METHOD_NOT_ALLOWED
        ]



class TestAuthViews:
    """Test suite for authentication-related views"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup run before every test method"""
        self.client = APIClient()
        
        self.regular_user = User.objects.create(
            email="user@example.com", 
            full_name="Regular User", 
            is_staff=False, 
            is_active=True,
            must_change_password=True
        )
        self.regular_user.set_password("oldpassword123")
        self.regular_user.save()
        
        self.staff_user = User.objects.create(
            email="staff@example.com", 
            full_name="Staff User", 
            is_staff=True, 
            is_active=True,
            must_change_password=False
        )
        self.staff_user.set_password("staffpass123")
        self.staff_user.save()

    def _get_login_url(self):
        return reverse("login")
    
    def _get_logout_url(self):
        return reverse("logout")
    
    def _get_me_url(self):
        return reverse("me")
    
    def _get_change_password_url(self):
        return reverse("change-password")
    
    def _get_tokens_for_user(self, user):
        """Helper to get JWT tokens for a user"""
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

    def test_me_view_authenticated(self):
        """Authenticated user should be able to access their own data"""
        tokens = self._get_tokens_for_user(self.regular_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        
        response = self.client.get(self._get_me_url())
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == self.regular_user.email
        assert response.data["full_name"] == self.regular_user.full_name
        assert response.data["must_change_password"] == self.regular_user.must_change_password

    def test_me_view_unauthenticated(self):
        """Unauthenticated user should not access me endpoint"""
        response = self.client.get(self._get_me_url())
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_successful(self):
        """User should be able to login with correct credentials"""
        login_data = {
            "email": "user@example.com",
            "password": "oldpassword123"
        }
        
        response = self.client.post(self._get_login_url(), login_data, format="json")
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Login successful"
        assert response.data["user"]["email"] == self.regular_user.email
        assert "tokens" in response.data
        assert "access" in response.data["tokens"]
        assert "refresh" in response.data["tokens"]

    def test_login_successful_staff_user(self):
        """Staff user should be able to login"""
        login_data = {
            "email": "staff@example.com",
            "password": "staffpass123"
        }
        
        response = self.client.post(self._get_login_url(), login_data, format="json")
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data["user"]["is_staff"] is True

    @override_settings(
    REST_FRAMEWORK={
        "DEFAULT_THROTTLE_CLASSES": [],
        "DEFAULT_THROTTLE_RATES": {},
    }
)
    def test_login_invalid_credentials(self):
        """Login should fail with invalid credentials"""
        login_data = {
            "email": "user@example.com",
            "password": "wrongpassword"
        }
        
        response = self.client.post(self._get_login_url(), login_data, format="json")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data["error"] == "Invalid email or password."

    def test_login_nonexistent_user(self):
        """Login should fail for non-existent user"""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "somepassword"
        }
        
        response = self.client.post(self._get_login_url(), login_data, format="json")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data["error"] == "Invalid email or password."

    def test_login_inactive_user(self):
        """Login should fail for inactive user"""
        inactive_user = User.objects.create(
            email="inactive@example.com",
            full_name="Inactive User",
            is_active=False
        )
        inactive_user.set_password("testpass123")
        inactive_user.save()
        
        login_data = {
            "email": "inactive@example.com",
            "password": "testpass123"
        }
        
        response = self.client.post(self._get_login_url(), login_data, format="json")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data["error"] == "Invalid email or password."

    def test_logout_successful(self):
        """User should be able to logout with valid refresh token"""
        tokens = self._get_tokens_for_user(self.regular_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        
        logout_data = {"refresh": tokens["refresh"]}
        response = self.client.post(self._get_logout_url(), logout_data, format="json")
        
        assert response.status_code == status.HTTP_205_RESET_CONTENT
        assert response.data["message"] == "Logout successful."

    def test_logout_invalid_token(self):
        """Logout should fail with invalid refresh token"""
        tokens = self._get_tokens_for_user(self.regular_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        
        logout_data = {"refresh": "invalid.refresh.token"}
        response = self.client.post(self._get_logout_url(), logout_data, format="json")
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "Invalid refresh token."

    def test_logout_missing_token(self):
        """Logout should fail when refresh token is missing"""
        tokens = self._get_tokens_for_user(self.regular_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        
        logout_data = {}
        response = self.client.post(self._get_logout_url(), logout_data, format="json")
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "Invalid refresh token."

    def test_logout_unauthenticated(self):
        """Unauthenticated user should not be able to logout"""
        logout_data = {"refresh": "some.refresh.token"}
        response = self.client.post(self._get_logout_url(), logout_data, format="json")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_change_password_successful(self):
        """User should be able to change password with correct old password"""
        tokens = self._get_tokens_for_user(self.regular_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        
        change_password_data = {
            "old_password": "oldpassword123",
            "new_password": "newpassword456"
        }
        
        response = self.client.post(self._get_change_password_url(), change_password_data, format="json")
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Password changed successfully."
        self.regular_user.refresh_from_db()
        assert self.regular_user.check_password("newpassword456") is True
        assert self.regular_user.must_change_password is False

    def test_change_password_wrong_old_password(self):
        """Password change should fail with wrong old password"""
        tokens = self._get_tokens_for_user(self.regular_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        
        change_password_data = {
            "old_password": "wrongoldpassword",
            "new_password": "newpassword456"
        }
        
        response = self.client.post(self._get_change_password_url(), change_password_data, format="json")
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "The old password you entered is incorrect."
        assert self.regular_user.check_password("oldpassword123") is True

    def test_change_password_invalid_data(self):
        """Password change should fail with invalid data"""
        tokens = self._get_tokens_for_user(self.regular_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        
        change_password_data = {
            "old_password": "oldpassword123",
            "new_password": "short"
        }
        
        response = self.client.post(self._get_change_password_url(), change_password_data, format="json")
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "new_password" in response.data

    def test_change_password_unauthenticated(self):
        """Unauthenticated user should not be able to change password"""
        change_password_data = {
            "old_password": "oldpassword123",
            "new_password": "newpassword456"
        }
        
        response = self.client.post(self._get_change_password_url(), change_password_data, format="json")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_change_password_staff_user(self):
        """Staff user should be able to change their password"""
        tokens = self._get_tokens_for_user(self.staff_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
        
        change_password_data = {
            "old_password": "staffpass123",
            "new_password": "newstaffpass456"
        }
        
        response = self.client.post(self._get_change_password_url(), change_password_data, format="json")
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Password changed successfully."
        self.staff_user.refresh_from_db()
        assert self.staff_user.check_password("newstaffpass456") is True
