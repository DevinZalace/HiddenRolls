Pod::Spec.new do |s|
  s.name           = 'HiddenRollsProvisioning'
  s.version        = '0.1.0'
  s.summary        = 'Native provisioning support for Hidden Rolls.'
  s.description    = 'Provides Hidden Rolls tray provisioning and discovery for iOS.'
  s.author         = 'D&T Manufacturing LLC'
  s.homepage       = 'https://github.com/DevinZalace/HiddenRolls'
  s.license        = { :type => 'MIT' }

  s.platform       = :ios, '15.1'
  s.swift_version  = '5.9'

  s.source = {
    :git => 'https://github.com/DevinZalace/HiddenRolls.git',
    :tag => s.version.to_s
  }

  s.source_files = '**/*.swift'

  s.dependency 'ExpoModulesCore'
  s.dependency 'ESPProvision', '3.1.0'
end