from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from users.models import User
from support.models import HelpRequest, HelpStatus


def add_group(user: User, group_name: str):
    group, _ = Group.objects.get_or_create(name=group_name)
    user.groups.add(group)
    user.save()


class SupportAPITests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='owner', password='pass')
        self.other = User.objects.create_user(username='other', password='pass')
        self.staff = User.objects.create_user(username='staff', password='pass', is_staff=True)
        # Also test agronomist role behavior
        self.agronomist = User.objects.create_user(username='agro', password='pass')
        add_group(self.agronomist, 'agronomist')

        self.list_url = '/api/support/'

    def auth(self, user: User) -> APIClient:
        c = APIClient()
        c.force_authenticate(user)
        return c

    def test_owner_crud_flow(self):
        client = self.auth(self.owner)
        # Create
        res = client.post(self.list_url, {'message': 'Need help with pests.'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        ticket_id = res.json()['id']

        # List only own
        HelpRequest.objects.create(user=self.other, message='Other ticket')
        res = client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.json()), 1)

        # Update own message and status
        res = client.patch(f'{self.list_url}{ticket_id}/', {'message': 'Updated msg', 'status': HelpStatus.IN_PROGRESS}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()['message'], 'Updated msg')
        self.assertEqual(res.json()['status'], HelpStatus.IN_PROGRESS)

        # Delete own
        del_res = client.delete(f'{self.list_url}{ticket_id}/')
        self.assertEqual(del_res.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_can_view_all_and_update_status_only(self):
        # Create two tickets by different users
        t1 = HelpRequest.objects.create(user=self.owner, message='Owner issue')
        t2 = HelpRequest.objects.create(user=self.other, message='Other issue')

        # Staff list sees both
        sc = self.auth(self.staff)
        res = sc.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.json()), 2)

        # Staff can update status but not message
        res = sc.patch(f'{self.list_url}{t1.id}/', {'status': HelpStatus.CLOSED}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()['status'], HelpStatus.CLOSED)

        res = sc.patch(f'{self.list_url}{t1.id}/', {'message': 'should not'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # Staff cannot delete others' tickets
        res = sc.delete(f'{self.list_url}{t1.id}/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Agronomist behaves like staff
        ac = self.auth(self.agronomist)
        res = ac.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.json()), 2)

    def test_auth_required(self):
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        res = self.client.post(self.list_url, {'message': 'x'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
