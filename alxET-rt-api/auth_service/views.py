from rest_framework import viewsets, status, permissions
from rest_framework.generics import GenericAPIView
from rest_framework.throttling import AnonRateThrottle
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiResponse
from rest_framework import serializers

from .serializers import UserSerializer, LoginSerializer, ChangePasswordSerializer
from .models import User, Officer
from .tokens import create_jwt_pair_user

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    def get_queryset(self):
        user = self.request.user
        if user.is_active  and user.is_staff:
            return User.objects.all().order_by('id')
        return User.objects.filter(id=user.id)

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return super().get_permissions()

class LoginRateThrottle(AnonRateThrottle):
    rate = '5/min'

class LoginView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = create_jwt_pair_user(user)
            return Response({
                "message": "Login successful",
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "full_name": user.full_name,
                    "must_change_password ":user.must_change_password,
                    "is_staff": user.is_staff,
                    "is_active": user.is_active
                },
                "tokens": tokens
            }, status=status.HTTP_200_OK)
        return Response({
            "error": "Invalid email or password."
        }, status=status.HTTP_401_UNAUTHORIZED)

class LogOutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        request=inline_serializer(
            name="LogoutRequest",
            fields={
                "refresh": serializers.CharField(),
            },
        ),
        responses={
            205: inline_serializer(
                name="LogoutSuccess",
                fields={"message": serializers.CharField()},
            ),
            400: inline_serializer(
                name="LogoutError",
                fields={"error": serializers.CharField()},
            ),
        },
    )
    def post(self, request):
        try:
            token_refresh = request.data['refresh']
            token = RefreshToken(token_refresh)
            token.blacklist()
            return Response({
                "message":"Logout successful."
            }, status = status.HTTP_205_RESET_CONTENT)
        except (KeyError, TokenError):
            return Response({"error":"Invalid refresh token."},status = status.HTTP_400_BAD_REQUEST)
        
        
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        if not user.check_password(old_password):
            return Response({"error": "The old password you entered is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.must_change_password = False
        user.save()
        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)
