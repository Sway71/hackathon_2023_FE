import { error } from '@sveltejs/kit';

export function load({ params }) {
  return {
    room: params.room,
  }
}