import pytest
from auth_service.serializers import UserSerializer, LoginSerializer, ChangePasswordSerializer
from auth_service.models import User, Officer
from django.test import override_settings
pytestmark = pytest.mark.django_db

def test_create_user_creates_officer():
    user_data = {
        "email": "test@example.com",
        "full_name": "Test User",
        "password": "strongpassword"
    }
    serializer = UserSerializer(data=user_data)
    assert serializer.is_valid(), serializer.errors

    user = serializer.save()
    assert user.email == user_data['email']
    assert user.full_name == user_data['full_name']

    assert user.password != user_data['password']
    assert user.check_password(user_data['password'])

    assert hasattr(user, 'officer_profile')
    assert Officer.objects.filter(user=user).exists()


def test_update_user_changes_password():
    user = User.objects.create_user(email="u1@example.com", full_name="Old Name", password="oldpass")

    update_data = {
        "full_name": "New Name",
        "password": "newpass123"
    }

    serializer = UserSerializer(instance=user, data=update_data, partial=True)
    assert serializer.is_valid(), serializer.errors

    updated_user = serializer.save()

    assert updated_user.full_name == "New Name"
    assert updated_user.check_password("newpass123")  # new password applied


def test_update_user_without_password_keeps_old_password():
    user = User.objects.create_user(email="u2@example.com", full_name="User2", password="mypassword")

    update_data = {
        "full_name": "User2 Updated"
    }

    serializer = UserSerializer(instance=user, data=update_data, partial=True)
    assert serializer.is_valid(), serializer.errors

    updated_user = serializer.save()
    assert updated_user.full_name == "User2 Updated"
    assert updated_user.check_password("mypassword")


def test_login_serializer_valid_credentials():
    password = "mypassword123"
    user = User.objects.create(
        email="login@example.com",
        full_name="Login User",
        is_active=True,
    )
    user.set_password(password)
    user.save()
    
    serializer = LoginSerializer(data = {
        'email':user.email,
        'password':password
    })
    
    assert serializer.is_valid(),serializer.errors
    assert serializer.validated_data['user'] == user

def test_login_serializer_invalid_credentials():
    password = "rightpassword"
    user = User.objects.create(
        email="wrong@example.com",
        full_name="Wrong User",
        is_active=True,
    )
    user.set_password(password)
    user.save()

    serializer = LoginSerializer(data={"email": user.email, "password": "wrongpassword"})
    assert not serializer.is_valid()
    assert "non_field_errors" in serializer.errors or "__all__" in serializer.errors

def test_login_serializer_invalid_email():
    raw_password = "correctpassword"
    user = User.objects.create(
        email="rightemail@example.com",
        full_name="Email User",
        is_active=True,
    )
    user.set_password(raw_password)
    user.save()

    serializer = LoginSerializer(data={
        "email": "wrongemail@example.com",
        "password": raw_password,
    })

    assert not serializer.is_valid()
    assert "non_field_errors" in serializer.errors


def test_change_password_serializer_valid():
    data = {
        "old_password": "oldpassword123",
        "new_password": "newpassword456",
    }
    serializer = ChangePasswordSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    validated = serializer.validated_data
    assert validated["old_password"] == data["old_password"]
    assert validated["new_password"] == data["new_password"]


def test_change_password_serializer_same_as_old():
    data = {
        "old_password": "samepassword123",
        "new_password": "samepassword123",
    }
    serializer = ChangePasswordSerializer(data=data)
    assert not serializer.is_valid()
    assert "new_password" in serializer.errors
    assert serializer.errors["new_password"][0] == "New password must be different from old password."


@override_settings(AUTH_PASSWORD_VALIDATORS=[{
    "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    "OPTIONS": {"min_length": 8},
}])
def test_change_password_serializer_invalid_new_password():
    user = User.objects.create(email="user@example.com", full_name="Test User")
    user.set_password("oldpassword123")
    user.save()
    serializer = ChangePasswordSerializer(
        data={
            "old_password": "oldpassword123",
            "new_password": "123",
        },
        context={"user": user}
    )
    assert not serializer.is_valid()
    assert "new_password" in serializer.errors 

