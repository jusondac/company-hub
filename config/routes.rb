Rails.application.routes.draw do
  get "home/index"
  root "home#index"
  get "registrations/new"
  resource :session
  resource :registration, only: %i[new create]
  resources :passwords, param: :token

  # Employee management routes
  resources :employees do
    collection do
      patch :sort_position
      get :tree_view
    end
  end

  resources :boards do
    resources :cards do
      collection do
        patch :sort_position
      end
    end
    resources :tasks do
      collection do
        patch :sort_position
        patch :update_card
      end
    end
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
