import uuid
from django.contrib.auth.models import AbstractUser, Group, Permission, UserManager as BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.conf import settings


class UserManager(BaseUserManager):
    """Custom user model manager with additional methods."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom user model with email as the unique identifier."""
    
    # Remove username field and make email the unique identifier
    username_validator = UnicodeUsernameValidator()
    username = models.CharField(
        _('username'),
        max_length=150,
        unique=True,
        help_text=_('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
        validators=[username_validator],
        error_messages={
            'unique': _("A user with that username already exists."),
        },
    )
    
    email = models.EmailField(
        _('email address'),
        unique=True,
        error_messages={
            'unique': _("A user with that email already exists."),
        },
    )
    
    # Additional fields
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone = models.CharField(
        _('phone number'),
        validators=[phone_regex],
        max_length=17,
        blank=True,
        null=True,
        help_text=_('Format: +999999999 (up to 15 digits)')
    )
    
    # Timestamps
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)
    last_login = models.DateTimeField(_('last login'), auto_now=True)
    
    # Status flags
    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_(
            'Designates whether this user should be treated as active. '
            'Unselect this instead of deleting accounts.'
        ),
    )
    is_verified = models.BooleanField(
        _('verified'),
        default=False,
        help_text=_('Designates whether this user has verified their email.')
    )
    
    # Security
    email_verification_token = models.UUIDField(default=uuid.uuid4, editable=False)
    password_reset_token = models.UUIDField(null=True, blank=True)
    password_reset_token_created_at = models.DateTimeField(null=True, blank=True)
    
    # Preferences
    preferred_language = models.CharField(
        _('preferred language'),
        max_length=10,
        choices=settings.LANGUAGES,
        default=settings.LANGUAGE_CODE
    )
    
    objects = UserManager()
    
    # Use email as the username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'auth_user'
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.email
    
    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)
    
    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        full_name = f'{self.first_name} {self.last_name}'.strip()
        return full_name or self.email
    
    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name or self.email.split('@')[0]
    
    # Role-based properties
    @property
    def is_farmer(self):
        return self.groups.filter(name='farmer').exists()
    
    @property
    def is_agronomist(self):
        return self.groups.filter(name='agronomist').exists()
    
    @property
    def is_supplier(self):
        return self.groups.filter(name='supplier').exists()
    
    @property
    def is_extension_officer(self):
        return self.groups.filter(name='extension_officer').exists()
    
    # Permission methods
    def has_module_perms(self, app_label):
        """Does the user have permissions to view the app `app_label`?"""
        return self.is_superuser or self.user_permissions.filter(
            content_type__app_label=app_label
        ).exists() or self.groups.filter(
            permissions__content_type__app_label=app_label
        ).exists()
    
    def has_perm(self, perm, obj=None):
        """Does the user have the specified permission?"""
        if self.is_active and self.is_superuser:
            return True
        return super().has_perm(perm, obj)


class UserProfile(models.Model):
    """Extended user profile information."""
    
    class Gender(models.TextChoices):
        MALE = 'M', _('Male')
        FEMALE = 'F', _('Female')
        OTHER = 'O', _('Other')
        PREFER_NOT_TO_SAY = 'N', _('Prefer not to say')
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name=_('user')
    )
    
    # Personal Information
    bio = models.TextField(_('biography'), blank=True, help_text=_('Tell us about yourself'))
    gender = models.CharField(
        _('gender'),
        max_length=1,
        choices=Gender.choices,
        blank=True,
        null=True
    )
    date_of_birth = models.DateField(
        _('date of birth'),
        null=True,
        blank=True,
        help_text=_('Format: YYYY-MM-DD')
    )
    
    # Contact Information
    address = models.TextField(_('address'), blank=True)
    city = models.CharField(_('city'), max_length=100, blank=True)
    state = models.CharField(_('state/province'), max_length=100, blank=True)
    country = models.CharField(_('country'), max_length=100, blank=True)
    postal_code = models.CharField(_('postal code'), max_length=20, blank=True)
    
    # Profile Picture
    profile_picture = models.ImageField(
        _('profile picture'),
        upload_to='profile_pics/%Y/%m/%d/',
        blank=True,
        null=True,
        help_text=_('Upload a profile picture')
    )
    
    # Social Media Links
    website = models.URLField(_('website'), blank=True)
    twitter = models.CharField(_('twitter username'), max_length=15, blank=True)
    facebook = models.URLField(_('facebook profile'), blank=True)
    linkedin = models.URLField(_('linkedin profile'), blank=True)
    
    # Preferences
    receive_newsletter = models.BooleanField(
        _('receive newsletter'),
        default=True,
        help_text=_('Receive our newsletter')
    )
    email_notifications = models.BooleanField(
        _('email notifications'),
        default=True,
        help_text=_('Receive email notifications')
    )
    
    # Metadata
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('user profile')
        verbose_name_plural = _('user profiles')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.get_full_name() or self.user.email} profile'
    
    @property
    def age(self):
        """Return the user's age based on date of birth."""
        if not self.date_of_birth:
            return None
        today = timezone.now().date()
        return (
            today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        )
    
    def get_full_address(self):
        """Return the full address as a formatted string."""
        parts = [
            self.address,
            self.city,
            self.state,
            self.postal_code,
            self.country
        ]
        return ', '.join(filter(None, parts))
    
    def clean(self):
        """Custom validation for the profile."""
        super().clean()
        if self.date_of_birth and self.date_of_birth > timezone.now().date():
            raise ValidationError({
                'date_of_birth': _('Date of birth cannot be in the future.')
            })
