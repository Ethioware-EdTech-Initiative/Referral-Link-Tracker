from rest_framework_simplejwt.tokens import RefreshToken

def create_jwt_pair_user(user):
    refresh_tok = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh_tok),
        'access': str(refresh_tok.access_token),
    }